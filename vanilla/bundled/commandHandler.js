import { ApiUtils } from "./apiUtils.js";

export class CommandHandler {

    api;
    callBack;

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
                    this.tryGetIncomeStatement();
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

                case "create":
                    this.handleCreates(entity);
                    return;
                default:
                    break;
            }
            this.addError("Unknown action: " + entity.action);
        }
    }

    async tryCreateWorkitem(chatData) {
        const rel = await this.getWorkRelation();
        if (rel) {
            const types = await this.api.get('api/biz/worktypes?top=10');
            const workitems = [ this.parseWork(chatData.input, rel, types) ];
            const more = ApiUtils.getFuzzy(chatData.input, "meeting");
            if (more) {
                const item2 = this.parseWork(more, rel, types);
                if (item2) {
                    workitems.push(item2);
                }
            }
            const items = await this.api.post("api/biz/workitems", workitems);
            if (items && items.length > 0) {
                items.forEach(item => {
                    this.addMsg(`Timeføring på ${ApiUtils.minutesToHours(item.Minutes)} opprettet`);
                });
            }

        } else {
            this.addError('You must first set up Timetracking on your user');
        }
    }

    async tryGetIncomeStatement() {
        const statement = await this.api.get('/api/statistics?model=account&select=sum(l.amount) as profit&filter=between(accountnumber,3000,8199) and year(l.financialdate) eq year(now())&join=account.id eq journalentryline.accountid as l&wrap=false');
        if (statement && statement.length > 0) {
            const profit = -statement[0].profit;
            this.addMsg("Resultat før skatt (EBIT) er " + Intl.NumberFormat("nb-NO", { style: 'currency', currency: "NOK"}).format((profit)));
        }
    }

    async tryGetBankStatement() {
        const statement = await this.api.get('/api/statistics?model=account&select=sum(l.amount) as value&filter=between(accountnumber,1900,1949)&join=account.id eq journalentryline.accountid as l&wrap=false');
        if (statement && statement.length > 0) {
            const value = statement[0].value;
            this.addMsg("Sum bankinskudd er " + Intl.NumberFormat("nb-NO", { style: 'currency', currency: "NOK"}).format((value)));
        }
    }

    async tryGetProducts() {
        const list = await this.api.get('/api/biz/products?top=10&select=ID,Name,PartName,PriceExVat&orderby=id desc');
        if (list && list.length > 0) {
            list.reverse().forEach( p =>
                this.addMsg(`${p.PartName} - ${p.Name} med pris ${ApiUtils.formatMoney(p.PriceExVat)}`)
            );
        }
    }

    async tryGetOrders(chatData) {
        const nr = ApiUtils.getFuzzy(chatData.input, "ordernumber", "orderid", "nr");
        if (nr && Number(nr)) {
            this.tryGetSingleOrder(nr);
            return;
        }
        const statusList = { 41001: "Kladd", 41002: "Åpen", 41003: "Delfakturert", 41004: "Fakturert", 41005: "Avsluttet" };
        const list = await this.api.get('/api/biz/orders?top=10&select=OrderNumber,CustomerName,TaxInclusiveAmount,StatusCode'
            + '&filter=StatusCode lt 41005&orderby=id desc');
        if (list && list.length > 0) {
            list.reverse().forEach( item => {
                    item.Status = statusList[item.StatusCode] ?? item.StatusCode;
                    this.addMsg(`${item.OrderNumber} ${item.CustomerName} (${item.Status}) totalsum ${ApiUtils.formatMoney(item.TaxInclusiveAmount)}`);
                }
            );
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
            var output = [];
            item.Status = statusList[item.StatusCode] ?? item.StatusCode;
            output.push(`Ordre: ${item.OrderNumber} (${item.Status}): totalsum ${ApiUtils.formatMoney(item.TaxInclusiveAmount)}`);
            output.push(`Kunde: ${item.CustomerName}`);
            if (item.Items && item.Items.length) {
                let n = 0;
                item.Items.forEach( line => {
                    n++; if (n == 10) { this.addMsg("..."); } if (n >= 10) return;
                    output.push(`${line.Product?.PartName ?? "***"} ${line.ItemText}`
                        + (line.NumberOfItems
                            ? `(${line.NumberOfItems} * ${ApiUtils.formatMoney(line.PriceExVat)}) = ${ApiUtils.formatMoney(line.SumTotalExVat)}`
                            : ""
                        ));
                });
            }
            output.reverse().forEach( o => this.addMsg(o));
        } else {
            this.addMsg("Fant ikke ordre nr." + nr);
        }
    }

    async tryDeleteOrder(chatData) {
        const nr = ApiUtils.getFuzzy(chatData.input, "ordernumber", "orderid", "ordrenr", "nr", "id");
        if (nr && Number(nr) > 0) {
            const orders = await this.api.get('/api/biz/orders?top=1&select=ID,OrderNumber,CustomerName,TaxInclusiveAmount&filter=ordernumber eq ' + nr);
            if (orders && orders.length === 1) {
                const item = orders[0];
                const ok = await this.api.action(`api/biz/orders/${item.ID}?action=complete`, "POST");
                if (ok) {
                    this.addMsg(`Slettet ordre: ${item.OrderNumber} - ${item.CustomerName} med totalsum ${ApiUtils.formatMoney(item.TaxInclusiveAmount)}`)
                }
            } else {
                this.addError("Fant ikke ordre nr. " + nr);
            }
        }
    }

    async tryCreateOrder(chatData) {
        const customerName = ApiUtils.getFuzzy(chatData.input, "customer");
        const orderNumber = ApiUtils.getFuzzy(chatData.input, "order", "ordernumber", "orderid", "nr", "id");
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
            //const link = "https://test.unimicro.no/#/sales/orders/" + updated.ID;
            const updated = await this.tryAddItems(order, chatData);
            if (updated) {
                this.addMsg("Ordren har nå en totalsum på " + ApiUtils.formatMoney(order.TaxInclusiveAmount));
            } else {
                this.addMsg("Ordre: " + order.OrderNumber);
            }
        }
    }

    async tryAddItems(order, chatData) {
        let input = ApiUtils.getFuzzy(chatData.input, "items", "lines");
        if (!input) {
            const name = ApiUtils.getFuzzy(chatData.input, "product", "item", "additem", "add", "productid" );
            if (name) {
                input = [ { Name: name }];
            }
        }

        if (input && Array.isArray(input)) {
            const items = input.map( item =>  {
                const partName = ApiUtils.getFuzzy(item, "name");
                return {
                    PartName: partName,
                    ItemText: partName,
                    NumberOfItems: Number(ApiUtils.getFuzzy(item, "quantity")) || 1,
                    _createguid: ApiUtils.createGuid()
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
                            ? apiProducts.find( pi => ApiUtils.textEquals(pi.PartName, i.PartName) || ApiUtils.textEquals(pi.Name, i.PartName))
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
            this.addMsg("Fant kunden i selskapet");
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
            this.addMsg("Fant en åpen ordre nr. " + orders[0].OrderNumber);
            return orders[0];
        } else {
            this.addMsg("Prøver å opprette ordre mot " + customer.CustomerNumber);
            const order = {
                CustomerID: customer.ID,
                InvoiceReceiverName:name,
                OrderDate: ApiUtils.formatDate(new Date())
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
        switch (ApiUtils.getFuzzy(chatData.input, "subaction")) {
            case "product":
                await tryCreateProduct(chatData);
                return true;
        }
        return false;
    }

    async handleFetch(chatData) {
        switch (ApiUtils.getFuzzy(chatData.input, "subaction")) {
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
        }
    }

    async tryCreateProduct(chatData) {
        const productName = ApiUtils.getFuzzy(chatData.input, "type", "product", "name");
        const price = parseInt(ApiUtils.getFuzzy(chatData.input, "price", "pris"));
        const dto = { Name: productName, PriceExVat: price };
        const id = ApiUtils.getFuzzy(chatData.input, "partname", "id", "productnumber");
        let exist;
        if (id) {
            dto.PartName = id;
            exist = await this.api.get(`api/biz/products?filter=partname eq '${dto.id}'`);
        } else {
            exist = await this.api.get(`api/biz/products?filter=name eq '${dto.Name}'`);
        }
        if (exist && exist.length > 0) {
            const prod = exist[0];
            this.addMsg(`Produktet "${prod.Name}" finnes allerede som nr. ${prod.PartName} (id:${prod.ID}) og  pris ${ApiUtils.formatMoney(prod.PriceExVat)}`);
            return;
        }
        const product = await this.api.post("api/biz/products", dto);
        if (product) {
            this.addMsg(`Produkt ${product.ID} - ${product.Name} med pris ${ApiUtils.formatMoney(product.PriceExVat)}`);
        }
    }
    

    addError(msg) {
        console.error(msg);
        if (this.callBack) this.callBack("error", msg);
    }

    addMsg(msg, link) {
        console.log(msg)
        if (this.callBack) this.callBack("chat", msg);
    }

    parseWork(input, rel, types) {
        if (typeof input === 'number') return undefined;
        const tFrom = ApiUtils.getFuzzy(input, "from", "start");
        let tTo = ApiUtils.getFuzzy(input, "to", "end");
        tTo = tTo < tFrom ? tTo + 12 : tTo;
        if (tTo == tFrom) tTo = tFrom + 1;
        const workitem = {
            WorkTypeID: types[0].ID,
            WorkRelationID: rel.ID,
            Description: ApiUtils.getFuzzy(input, "person") || "Timeføring fra Chat",
            Minutes: (tTo - tFrom) * 60,
            Date: ApiUtils.formatDate(new Date()),
            StartTime: ApiUtils.formatTime(new Date(), tFrom),
            EndTime: ApiUtils.formatTime(new Date(), tTo),
        };
        const lunch = ApiUtils.getFuzzy(input, "lunchbreak", "lunch", "pause");
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