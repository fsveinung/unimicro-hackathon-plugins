import { ChatUtils } from "./chatUtils.js";
import { KpiService } from "./kpi.js";

export class CommandHandler {

    api;
    callBack;
    objectHistory;

    /**
     *
     * @param {Api} api
     * @param {number} userid
     * @param {Function} callBack
     */
    constructor(api, userid, callBack) {
        this.api = api;
        this.userid = userid;
        this.callBack = callBack;
    }

    handleCommand(json) {
        let entity;
        try {
            entity = JSON.parse(json);
        } catch (err) {
            this.addError(err);
            return;
        }
        if (entity && !!entity.action) {
            const subAction = entity.input?.subaction ?? "";
            switch (entity.action.toLowerCase()) {
                case "order":
                    if (subAction == "create" || subAction == "update" || subAction == "add") {
                        this.tryCreateOrder(entity);
                        return;
                    } else if (subAction == "delete") {
                        this.tryDeleteOrder(entity);
                        return;
                    }
                    this.tryGetOrders(entity);
                    return;

                case "invoice":
                    //{ "action": "invoice", "input": { "subaction": "create", "order": 12 } }
                    this.addError("Har ikke lært meg faktura biten, men noterer meg at det er noe jeg må lære meg...");
                    return;

                case "timetracking":
                    if (subAction == "create") {
                        this.tryCreateWorkitem(entity);
                        return;
                    }
                    break;
                case "result":
                case "incomestatement":
                case "imcome statement":
                case "imcome_statement":
                case "businessstatus":
                case "status":
                    //this.tryGetIncomeStatement();
                    this.tryGetStatus(entity);
                    return;

                case "balance":
                case "bankaccount":
                case "balancesheet":
                case "bankbalance":
                case "balanceinquiry":
                case "bankstatement":
                case "bankstatus":
                case "banksaldo":
                case "balancestatement":
                case "accountbalance":
                case "accountstatement":
                case "fetchbalance":
                    this.tryGetBankStatement();
                    return;
                case "fetch":
                    this.handleFetch(entity);
                    return;

                case "product":
                    this.tryCreateProduct(entity);
                    return;
                case "productlist":
                case "products":
                    this.tryGetProducts(entity);
                    return;


                case "employees":
                    // { "action": "employees", "input": { "subaction": "fetch" }, "message": "Kan ikke svare på dette spørsmålet, da det ikke er klart hva som skal gjøres." }
                    this.addError("Har ikke helt kontroll på ansatt-api'et enda. Men det kommer :)");
                    return;

                case "customer":
                    // { "action": "customer", "input": { "subaction": "fetch", "best": true } }
                    this.addError("Har ikke helt kontroll på kunde-api'et enda. Men det kommer :)");
                    return;

                case "accountspayable":
                case "accountsreceivable":
                    this.addError("Holder på å lære meg kunde/leverandør-reskontro biten, så jeg håper snart å kunne svare bedre på dette :)");
                    return;

                case "create":
                    this.handleCreates(entity);
                    return;

                case "journal":
                    this.tryGetJournals(entity);
                    return;

                case "thankyou":
                case "praise":
                case "acknowledge":
                case "cool":
                    this.addError("Bare hyggelig!", "praise")
                    return;

                case "error":
                    this.addError(entity.message);
                    return;

                default:
                    break;
            }
            this.addError(json, "unknown");
        }
    }

    async tryCreateWorkitem(chatData) {
        const rel = await this.getWorkRelation();
        if (rel) {
            const types = await this.api.get('api/biz/worktypes?top=10');
            const workitems = [ this.parseWork(chatData.input, rel, types) ];
            const more = ChatUtils.getFuzzy(chatData.input, "meeting");
            if (more) {
                const item2 = this.parseWork(more, rel, types);
                if (item2) {
                    workitems.push(item2);
                }
            }
            const items = await this.api.post("api/biz/workitems", workitems);
            if (items && items.length > 0) {
                items.forEach(item => {
                    this.addMsg(`Timeføring på ${ChatUtils.minutesToHours(item.Minutes)} opprettet`, 
                        { type: "workitem", id: item.ID }); 
                });
            }

        } else {
            this.addError('Du må først aktivere timeregistrering. Jeg tror du finner det under innstillinger / brukere');
        }
    }

    async tryGetIncomeStatement() {
        const year = new Date().getFullYear();
        const statement = await this.api.get(`/api/statistics?model=account&select=sum(l.amount) as profit&filter=between(accountnumber,3000,8199) and year(l.financialdate) eq ${year}&join=account.id eq journalentryline.accountid as l&wrap=false`);
        if (statement && statement.length > 0) {
            const profit = -statement[0].profit;
            this.addMsg("Resultat før skatt er " + Intl.NumberFormat("nb-NO", { style: 'currency', currency: "NOK"}).format((profit)), 
                { type: "profit", id: year });
        }
    }

    async tryGetStatus(chatData) {

        const thisYear = new Date().getFullYear(); 
        const year = ChatUtils.getFuzzy(chatData?.input, "year") == "last" ?  thisYear - 1 : thisYear;        
        const isThisYear = year == thisYear;
        const fromPeriod = 1;
        const toPeriod = isThisYear ? new Date().getMonth() + 1 : 12;
        
        // Fetch kpi-data
        const data = await this.api.get(`/api/biz/accounts?action=get-kpi&financialyear=${year}&period=${fromPeriod}-${toPeriod}`);
        
        // Parse data and compare years
        const parsed = KpiService.parseData(data);

        const periodInfo = toPeriod < 12
        ? `for de ${toPeriod} første månedene i ${year}`
        : `for ${year}`;

        const kpiName = "EarningsBeforeTaxes";
        var kpi = parsed.find( k => k.name == kpiName);
        if (!kpi) {
            this.addMsg(`Fant ingen omsetning ${periodInfo}. Kanskje du kan starte med å legge inn en åpningsbalanse eller sjekke status for i fjor ?`);
            return;
        }

        // Initial comment:
        const prefix = (isThisYear ? "" : `${year}: `);
        this.addMsg(prefix + KpiService.buildKpiText(kpi, true), { type: "profit", id: year }, true);

        // Make a second call for a comment:
        const prompt = `Du er regnskapsfører.`
        + ` Lag en kort kommentar på 2 linjer fra følgende fakta`
        + ` ${periodInfo}`
        + `: ${KpiService.buildKpiText(kpi, false)}`;

        const finalComment = await this.prompt(prompt, 75);
        this.addMsg(finalComment?.choices[0]?.message?.content);

        // get last transaction ?
    }
    

    async prompt(prompt, temperature) {
        return await this.api.post("/api/biz/ai-generate?action=generate-text", {
            "Temperature": temperature || 0,
            "Prompt": prompt,
            "TopPercentage": 50
        });        
    }

    static trimLeadingLineBreaks(value) {
        if (value && value.startsWith("\n"))
        return this.trimLeadingLineBreaks(value.substring(1));
        return value;
    }    

    async tryGetBankStatement() {
        const statement = await this.api.get('/api/statistics?model=account&select=sum(l.amount) as value&filter=between(accountnumber,1900,1949)&join=account.id eq journalentryline.accountid as l&wrap=false');
        if (statement && statement.length > 0) {
            const value = statement[0].value;
            this.addMsg("Sum bankinskudd er " + Intl.NumberFormat("nb-NO", { style: 'currency', currency: "NOK"}).format((value)));
        }
    }

    async tryGetProducts() {
        const list = await this.api.get('/api/statistics?model=product&select=ID as _id,PartName as Nr,Name as Navn,PriceExVat as Pris'
            + '&orderby=id desc&wrap=false&top=10');
        if (list && list.length > 0) {
            list.forEach( item => {
                item.Pris = ChatUtils.formatMoney(item.Pris);
            });
            this.addMsg(list);
        }
    }

    async tryGetOrders(chatData) {
        const nr = ChatUtils.getFuzzy(chatData.input, "ordernumber", "number", "id", "orderid", "order_id", "nr");
        if (nr && Number(nr)) {
            this.tryGetSingleOrder(nr);
            return;
        }
        const statusList = { 41001: "Kladd", 41002: "Åpen", 41003: "Delfakturert", 41004: "Fakturert", 41005: "Avsluttet" };
        const list = await this.api.get('/api/statistics?model=customerorder&select=id as _id,OrderNumber as Nr,CustomerName as Kunde,TaxInclusiveAmount as Sum,StatusCode as Status'
            + '&filter=StatusCode lt 41005&orderby=id desc&top=10&wrap=false');
        if (list && list.length > 0) {
            list.forEach( item => item.Status = statusList[item.Status] ?? item.Status);
            this.addMsg(list);
        } else {
            this.addMsg("Fant ingen ordrer, kanskje du kan lage en?");
        }
    }

    async tryGetJournals(chatData) {
        const nr = ChatUtils.getFuzzy(chatData.input, "id", "nr", "entryid", "number");
        if (nr && Number(nr)) {
            const list = await this.api.get('/api/statistics?model=journalentryline'
                + '&select=ID as _id,JournalEntryNumber as Bilag,Amount as Sum,Description as Tekst,FinancialDate as Dato,Account.AccountNumber as Konto'
                + `&filter=JournalEntryNumber eq '${nr}-2024'&orderby=id desc`
                + '&expand=account&wrap=false');
            if (list && list.length > 0) {
                list.forEach( item => {
                    item.Sum = ChatUtils.formatMoney(item.Sum);
                    item.Dato = ChatUtils.formatDate(item.Dato);
                });
                this.addMsg(list);
            } else {
                this.addError("Fant ikke det bilaget. Beklager...")
            }
        } else {
            this.addMsg("Fant ikke bilaget, kanskje du kan lage det ?");
        }
    }

    async tryGetSingleOrder(nr, returnIt) {
        const statusList = { 41001: "Kladd", 41002: "Åpen", 41003: "Delfakturert", 41004: "Fakturert", 41005: "Avsluttet" };
        const list = await this.api.get(`/api/biz/orders?top=1&filter=ordernumber eq ${nr}&expand=items.product`);
        if (list && list.length > 0) {
            if (returnIt) {
                return list[0];
            }
            const item = list[0];
            const context = { type: "order", id: item.ID, nr: item.OrderNumber };
            var output = [];
            item.Status = statusList[item.StatusCode] ?? item.StatusCode;
            this.addMsg(`Ordre nr. ${item.OrderNumber} (status ${item.Status})`);
            this.addMsg(`${item.CustomerName}`);
            const lines = [];
            if (item.Items && item.Items.length) {
                let n = 0;
                item.Items.forEach( line => {
                    n++; if (n == 10) { output.push("..."); } if (n >= 10) return;
                    lines.push({
                        Antall: line.NumberOfItems, 
                        Produkt: line.ItemText, 
                        Pris: ChatUtils.formatMoney(line.PriceExVat), 
                        Sum:ChatUtils.formatMoney(line.SumTotalExVat)
                    });
                });
            }
            this.addMsg(lines);
            this.addMsg(`Totalsum ${ChatUtils.formatMoney(item.TaxInclusiveAmount)}`, context);

        } else {
            this.addMsg("Fant ikke ordre nr." + nr);
        }
    }

    async tryDeleteOrder(chatData) {
        let nr = ChatUtils.getFuzzy(chatData.input, "ordernumber", "orderid", "ordrenr", "nr", "id");
        if (!(nr && Number(nr) >0) && this.objectHistory?.type == "order") {
            console.log("using history:", this.objectHistory);
            nr = this.objectHistory.nr;
        }
        if (nr && Number(nr) > 0) {
            const orders = await this.api.get('/api/biz/orders?top=1&select=ID,OrderNumber,CustomerName,TaxInclusiveAmount&filter=ordernumber eq ' + nr);
            if (orders && orders.length === 1) {
                const item = orders[0];
                const ok = await this.api.post(`api/biz/orders/${item.ID}?action=complete`);
                console.log("ok?", ok);
                if (ok) {
                    this.addMsg(`Avsluttet ordre: ${item.OrderNumber} - ${item.CustomerName} med totalsum ${ChatUtils.formatMoney(item.TaxInclusiveAmount)}`)
                } else {
                    this.addMsg("Arkiverte ordre " + nr);
                }
            } else {
                this.addError("Fant ikke ordre nr. " + nr);
            }
        } else {
            this.addError("Usikker på hvilken du mener.");
        }
    }

    async tryCreateOrder(chatData) {

        // todo: handle this; { "action": "order", "input": { "subaction": "add", "number": 1, "to": 2 } }
        // could add product with id=1 to order.id = 2

        const customerName = ChatUtils.getFuzzy(chatData.input, "customer");
        const orderNumber = ChatUtils.getFuzzy(chatData.input, "order", "ordernumber", "orderid", "nr", "id");
        let order;
        if (customerName) {
            const customer = await this.getCustomer(customerName);
            if (customer) {
                order = await this.getOrder(customer, customerName);
            }
        } else if (orderNumber && Number(orderNumber)) {

            order = await this.tryGetSingleOrder(orderNumber, true);

        } else {
            this.addError("Mangler navn på kunden");
        }

        if (order) {
            const updated = await this.tryAddItems(order, chatData);
            if (updated) {
                this.addMsg("Ordren har nå en totalsum på " + ChatUtils.formatMoney(order.TaxInclusiveAmount),
                    { type: "order", id: order.ID, nr: order.OrderNumber });
            } else {
                this.addMsg("Ordre: " + order.OrderNumber,
                    { type: "order", id: order.ID, nr: order.OrderNumber });
            }
        }
    }

    async tryAddItems(order, chatData) {
        let input = ChatUtils.getFuzzy(chatData.input, "items", "lines");
        if (!input) {
            const name = ChatUtils.getFuzzy(chatData.input, "product", "item", "additem", "add", "productid" );
            if (name) {
                input = [ { Name: name }];
            }
        }

        if (input && Array.isArray(input)) {
            const items = input.map( item =>  {
                const partName = ChatUtils.getFuzzy(item, "name");
                return {
                    PartName: partName,
                    ItemText: partName,
                    NumberOfItems: Number(ChatUtils.getFuzzy(item, "quantity")) || 1,
                    _createguid: ChatUtils.createGuid()
                };
            });
            if (items.find( x => x.PartName)) {

                let apiProducts;
                if (input.length > 1) {
                    const partNames = items.map( p => "'" + p.PartName + "'" ).join(",")
                    apiProducts = await this.api.get(`api/biz/products?select=id,partname,name,priceexvat,priceincvat,vattypeid`
                        + `&filter=partname in (${partNames}) or name in (${partNames})`);
                }

                if (!(apiProducts && apiProducts.length > 0)) {
                    apiProducts = await this.api.get(`api/biz/products?select=id,partname,name,priceexvat,priceincvat,vattypeid`
                    + `&filter=startswith(name,'${items[0].PartName}')&orderby=id desc`);
                }

                if (!(apiProducts && apiProducts.length > 0) && Number(items[0].PartName)) {
                    apiProducts = await this.api.get(`api/biz/products?select=id,partname,name,priceexvat,priceincvat,vattypeid`
                    + `&filter=ID eq ${items[0].PartName}`);
                }

                if (apiProducts && apiProducts.length > 0) {
                    items.forEach( i => {

                        const match = input.length > 1
                            ? apiProducts.find( pi => ChatUtils.textEquals(pi.PartName, i.PartName) || ChatUtils.textEquals(pi.Name, i.PartName))
                            : apiProducts[0];

                        if (match && match.ID) {
                            i.ProductID = match.ID;
                            i.ItemText = match.Name;
                            i.PriceExVat = match.PriceExVat;
                            i.VatTypeID = match.VatTypeID;
                            i.NumberOfItems = i.NumberOfItems || 1;
                            order.TaxInclusiveAmount += (match.PriceIncVat || match.PriceExVat) * i.NumberOfItems;
                            this.addMsg("La til produktlinje " + match.ID + " (" + match.Name + ")");
                        } else {
                            this.addMsg("Fant ikke produkt " + i.PartName);
                        }
                    });
                }
            }
            order.Items = [ ... items];
            return await this.api.put(`api/biz/orders/${order.ID}`, order);
        }
    }

    async getCustomer(name) {
        this.addMsg("Prøver å hente : " + name);
        const customers = await this.api.get(`api/biz/customers?expand=info&filter=startswith(info.name,'${name}')`);
        if (customers && customers.length > 0) {
            this.addMsg("Fant kunden i selskapet", { type: "customer", id: customers[0].ID });
            return customers[0];
        } else {
            this.addMsg("Prøver å opprette kunden i selskapet");
            return await this.api.post(`api/biz/customers`, { Info: { Name: name } });
        }
    }

    async getOrder(customer, name) {
        const orders = await this.api.get(`api/biz/orders?expand=info&filter=customerid eq ${customer.ID}`
            + ' and statuscode le 41003&top=1&orderby=ID desc');
        if (orders && orders.length > 0) {
            this.addMsg("Fant en åpen ordre nr. " + orders[0].OrderNumber, { type: "order", id: orders[0].ID, nr: orders[0].OrderNumber } );
            return orders[0];
        } else {
            this.addMsg("Prøver å opprette ordre mot " + customer.CustomerNumber);
            const order = {
                CustomerID: customer.ID,
                InvoiceReceiverName:name,
                OrderDate: ChatUtils.formatDate(new Date())
            };
            return await this.api.post(`api/biz/orders`, order);
        }
    }

    async getWorkRelation() {
        const userid = this.userid;
        const rel = await this.api.get("api/biz/workrelations?expand=worker,workprofile&orderby=ID desc&filter=worker.userid eq " + userid);
        return rel && rel.length > 0 ? rel[0] : undefined;
    }

    async handleCreates(chatData) {
        const value = ChatUtils.getFuzzy(chatData.input, "subaction");
        switch (ChatUtils.value) {
            case "product":
                await tryCreateProduct(chatData);
                return true;
            default:
                this.addError(`Jeg vet ikke helt hvordan jeg kan opprette '${value}', men skal prøve å lære meg det så snart som mulig :)`);
        }
        return false;
    }

    async handleFetch(chatData) {
        const value = ChatUtils.getFuzzy(chatData.input, "subaction");
        switch (value) {
            case "productlist":
            case "products":
            case "product":
                await this.tryGetProducts(chatData);
                return true;
            case "orders":
            case "order":
            case "orderlist":
                await this.tryGetOrders(chatData);
                break;
            default:
                this.addError(`Har ikke helt kontroll på å finne '${value}', men skal prøve å lære meg det så snart som mulig :)`);
        }
    }

    async tryCreateProduct(chatData) {
        const productName = ChatUtils.getFuzzy(chatData.input, "type", "product", "name");
        if (!productName) {
            return this.tryGetProducts();
        }
        const price = parseInt(ChatUtils.getFuzzy(chatData.input, "price", "pris"));
        const dto = { Name: productName, PriceExVat: price };
        const id = ChatUtils.getFuzzy(chatData.input, "partname", "id", "productnumber");
        let exist;
        if (id) {
            dto.PartName = id;
            exist = await this.api.get(`api/biz/products?filter=partname eq '${dto.id}'`);
        } else {
            exist = await this.api.get(`api/biz/products?filter=name eq '${dto.Name}'`);
        }
        if (exist && exist.length > 0) {
            const prod = exist[0];
            this.addMsg(`Produktet "${prod.Name}" finnes allerede som nr. ${prod.PartName} (id:${prod.ID}) og  pris ${ChatUtils.formatMoney(prod.PriceExVat)}`,
                { type: "product", id: prod.ID });
            return;
        }
        const product = await this.api.post("api/biz/products", dto);
        if (product) {
            this.addMsg(`Produkt ${product.ID} - ${product.Name} med pris ${ChatUtils.formatMoney(product.PriceExVat)}`
                , { type: "product", id: product.ID });
        }
    }


    addError(msg, category) {
        console.error(msg);
        if (this.callBack) this.callBack(category ?? "error", msg);
    }

    addMsg(msg, context, keepSpinning ) {
        if (context) {
            this.objectHistory = context;
        }
        if (this.callBack) this.callBack("chat", msg, context, keepSpinning);
    }

    parseWork(input, rel, types) {
        if (typeof input === 'number') return undefined;
        const tFrom = ChatUtils.parseTime( ChatUtils.getFuzzy(input, "from", "start") );
        let tTo = ChatUtils.parseTime( ChatUtils.getFuzzy(input, "to", "end") );
        tTo = tTo < tFrom ? tTo + 12 : tTo;
        if (tTo == tFrom) tTo = tFrom + 1;
        const workitem = {
            WorkTypeID: types[0].ID,
            WorkRelationID: rel.ID,
            Description: ChatUtils.getFuzzy(input, "person") || "Timeføring fra Chat",
            Minutes: (tTo - tFrom) * 60,
            Date: ChatUtils.formatDate(new Date()),
            StartTime: ChatUtils.formatTime(new Date(), tFrom),
            EndTime: ChatUtils.formatTime(new Date(), tTo),
        };
        const lunch = ChatUtils.getFuzzy(input, "lunchbreak", "lunch", "pause");
        if (lunch) {
            // Hours or minutes?
            if (lunch <= 1) {
                workitem.LunchInMinutes = parseInt((60 * lunch).toFixed(0));
            } else if (lunch > 1) {
                workitem.LunchInMinutes = parseInt(lunch);
            }
            workitem.Minutes -= workitem.LunchInMinutes;
        }
        return workitem;
    }

}