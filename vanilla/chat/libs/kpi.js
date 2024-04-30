
export const FinancialKpiDefinitions = {
    CostOfGoodsSold: { label: 'Varekostnad', sign: 1, isCost: true, priority: 10 },
    CostOfGoodsSoldLastYear: { label: 'Varekostnad forrige år', sign: 1, isCost: true, priority: 10 },
    CostOfGoodsSoldYTD: { label: 'Varekostnad YTD', sign: 1, isCost: true, priority: 10 },
    CostOfGoodsSoldYTDLastYear: { label: 'Varekostnad YTD i forrige år', sign: 1, isCost: true, priority: 10 },
    Coverage: { label: 'Dekningsgrad', sign: 1, priority: 10 },
    CoverageLastYear: { label: 'Dekningsgrad forrige år', sign: 1, priority: 10 },
    CoverageYTD: { label: 'Dekningsgrad YTD', sign: 1, priority: 10 },
    CoverageYTDLastYear: { label: 'Dekningsgrad YTD forrige år', sign: 1, priority: 10 },
    EarningsBeforeTaxes: { label: 'Resultat før skatt', sign: -1, priority: 2 },
    EarningsBeforeTaxesLastYear: { label: 'Resultat før skatt forrige år', sign: -1, priority: 2 },
    EarningsBeforeTaxesYTD: { label: 'Resultat før skatt YTD', sign: -1, priority: 2 },
    EarningsBeforeTaxesYTDLastYear: { label: 'Resultat før skatt YTD forrige år', sign: -1, priority: 2 },
    EquityAssetsRatio: { label: 'Egenkapitalandel', sign: 1, priority: 10 },
    EquityAssetsRatioLastYear: { label: 'Egenkapitalandel forrige år', sign: 1, priority: 10 },
    EquityProfitabilityRatio: { label: 'Egenkapitalrentabilitet', sign: 1, priority: 10 },
    EquityProfitabilityRatioLastYear: { label: 'Egenkapitalrentabilitet forrige år', sign: 1, priority: 10 },
    Financials: { label: 'Finansposter', sign: -1, priority: 5 },
    FinancialsLastYear: { label: 'Finansposter forrige år', sign: -1, priority: 5 },
    FinancialsYTD: { label: 'Finansposter YTD', sign: -1, priority: 5 },
    FinancialsYTDLastYear: { label: 'Finansposter YTD forrige år', sign: -1, priority: 5 },
    GrossProfit: { label: 'Bruttomargin', sign: -1, priority: 4 },
    GrossProfitLastYear: { label: 'Bruttomargin forrige år', sign: -1, priority: 4 },
    GrossProfitYTD: { label: 'Bruttomargin YTD', sign: -1, priority: 4 },
    GrossProfitYTDLastYear: { label: 'Bruttomargin YTD forrige år', sign: -1, priority: 4 },
    LiquidityRatios1: { label: 'Likviditetsgrad 1', sign: 1, priority: 10 },
    LiquidityRatios1LastYear: { label: 'Likviditetsgrad 1 forrige år', sign: 1, priority: 10 },
    LiquidityRatios2: { label: 'Likviditetsgrad 2', sign: 1, priority: 10 },
    LiquidityRatios2LastYear: { label: 'Likviditetsgrad 2 forrige år', sign: 1, priority: 10 },
    LiquidityRatios3: { label: 'Likviditetsgrad 3', sign: 1, priority: 10 },
    LiquidityRatios3LastYear: { label: 'Likviditetsgrad 3 forrige år', sign: 1, priority: 10 },
    OperatingResult: { label: 'Driftsresultat', sign: -1, priority: 3 },
    OperatingResultLastYear: { label: 'Driftsresultat forrige år', sign: -1, priority: 3 },
    OperatingResultYTD: { label: 'Driftsresultat YTD', sign: -1, priority: 3 },
    OperatingResultYTDLastYear: { label: 'Driftsresultat YTD forrige år', sign: -1, priority: 3 },
    SalaryCosts: { label: 'Lønnskostnad', sign: 1, isCost: true, priority: 10 },
    SalaryCostsLastYear: { label: 'Lønnskostnad forrige år', sign: 1, isCost: true, priority: 10 },
    SalaryCostsYTD: { label: 'Lønnskostnad YTD', sign: 1, isCost: true, priority: 10 },
    SalaryCostsYTDLastYear: { label: 'Lønnskostnad YTD forrige år', sign: 1, isCost: true, priority: 10 },
    TotalProfitabilityRatio: { label: 'Totalrentabilitet', sign: 1, priority: 10 },
    TotalProfitabilityRatioLastYear: { label: 'Totalrentabilitet forrige år', sign: 1, priority: 10 },
    Turnover: { label: 'Salgsinntekt', sign: -1, priority: 7 },
    TurnoverLastYear: { label: 'Salgsinntekt forrige år', sign: -1, priority: 7 },
    TurnoverYTD: { label: 'Salgsinntekt YTD', sign: -1, priority: 7 },
    TurnoverYTDLastYear: { label: 'Salgsinntekt YTD forrige år', sign: -1, priority: 7 },
    WorkingCapital: { label: 'Arbeidskapital', sign: 1, priority: 8 },
    WorkingCapitalLastYear: { label: 'Arbeidskapital forrige år', sign: 1, priority: 8  }
};

export class KpiService {
    
    static formatMoney(value) {
        return Intl.NumberFormat("nb-NO", { style: 'currency', currency: "NOK", maximumFractionDigits: 0}).format(value);
    }

    static parseData(data) {

        // Map values into objects with norwegian text and presign-conversion
        const all = Object.keys(data).map(
            p => {
                const def = FinancialKpiDefinitions[p];
                return {
                        name: p,
                        value: data[p] * (def.sign ?? 1),
                        label: def.label ?? p,
                        priority: def.priority,
                        valueLastYear: 0,
                        title: '',
                        icon: '',
                        trendColor: '',
                        definition: def
                };
        });

        // Combine last-year with current year
        all.map( p => {
            if (p.name.endsWith('LastYear')) {
                const pfx = p.name.substring(0, p.name.length - 8);
                const pair = all.find( x => x.name.startsWith(pfx));
                if (pair) {
                    pair.valueLastYear = p.value;
                    pair.title = `Forrige år: ${KpiService.formatMoney(p.value)}`;
                    const isIncrement = pair.value > pair.valueLastYear;
                    const isDecrement = pair.value < pair.valueLastYear;
                    pair.icon = pair.valueLastYear
                            ? isIncrement ? "trending_up"
                            : isDecrement ? "trending_down"
                            : "trending_flat"
                        : "";
                    if (pair.icon) {
                        pair.trendColor = (isIncrement && pair.definition.isCost || isDecrement && !pair.definition.isCost)
                            ? "color-bad"
                            : isDecrement || isIncrement ? "color-good" : "";
                    }
                }
            }
        });

        // Sort and filter away YTD and LastYear
        return all
            .sort((a,b)=>a.priority > b.priority ? 1 : a.priority < b.priority -1 ? -1 : 0)
            .filter( item => item.name.indexOf('YTD')<0 && item.name.indexOf('LastYear')<0 && !!item.value );
    }

    static buildKpiText(kpi, includeNOK = false) {
        const tValue = this.formatMoney(kpi.value);
        const tValueLastYear = kpi.valueLastYear ? this.formatMoney(kpi.valueLastYear) : '';
        const tChange = this.formatMoney(kpi.value - (kpi.valueLastYear ?? 0));
        const tChangetext = tValueLastYear ? `Endring: ${tChange}.` : ''
        return `${kpi.label}: ${tValue}${(includeNOK ? " NOK" : "")} ${(tValueLastYear ? ` mot ${tValueLastYear} i fjor. ${tChangetext}` : "")}`;
    }
}