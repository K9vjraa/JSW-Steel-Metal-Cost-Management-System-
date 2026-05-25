import { Decimal } from "decimal.js";

export type CostItemInput = {
  id: string;
  name: string;
  quantity: string | number;
  unitPrice: string | number;
  gradeMultiplier?: string | number;
  extraPrice?: string | number;
  compositionPct?: string | number | null;
  gradeName?: string;
  sourceType?: "metal" | "rawMaterial";
};

export type ChargeInput = {
  name: string;
  kind: string;
  rate?: string | number | null;
  amount?: string | number | null;
};

const money = (value: Decimal) => value.toDecimalPlaces(4, Decimal.ROUND_HALF_UP);

export function calculateBreakdown(items: CostItemInput[], charges: ChargeInput[]) {
  if (items.length === 0) {
    throw new Error("At least one costing item is required.");
  }

  const itemRows = items.map((item) => {
    const quantity = new Decimal(item.quantity);
    const unitPrice = new Decimal(item.unitPrice);
    const gradeMultiplier = new Decimal(item.gradeMultiplier ?? 1);
    const extraPrice = new Decimal(item.extraPrice ?? 0);

    if (quantity.lte(0) || unitPrice.lt(0) || gradeMultiplier.lte(0) || extraPrice.lt(0)) {
      throw new Error(`Invalid money or quantity value for ${item.name}.`);
    }

    const baseCost = money(quantity.mul(unitPrice).mul(gradeMultiplier).add(extraPrice));
    return {
      ...item,
      quantity: quantity.toString(),
      unitPrice: unitPrice.toString(),
      gradeMultiplier: gradeMultiplier.toString(),
      extraPrice: extraPrice.toString(),
      baseCost: baseCost.toString()
    };
  });

  const baseCost = itemRows.reduce((total, item) => total.add(item.baseCost), new Decimal(0));
  const totalQuantity = itemRows.reduce((total, item) => total.add(item.quantity), new Decimal(0));
  const scrap = charges.find((charge) => charge.kind === "SCRAP");
  const transport = charges.find((charge) => charge.kind === "TRANSPORT");
  const gst = charges.find((charge) => charge.kind === "GST");
  const additions = charges.filter((charge) => charge.kind === "ADDITIONAL");
  const scrapCost = scrap?.rate ? baseCost.mul(new Decimal(scrap.rate).div(100)) : new Decimal(scrap?.amount ?? 0);
  const transportCost = transport?.rate
    ? totalQuantity.mul(new Decimal(transport.rate))
    : new Decimal(transport?.amount ?? 0);
  const additionalCost = additions.reduce(
    (total, charge) => total.add(charge.amount ?? 0).add(charge.rate ? baseCost.mul(new Decimal(charge.rate).div(100)) : 0),
    new Decimal(0)
  );
  const taxableSubtotal = baseCost.add(scrapCost).add(transportCost).add(additionalCost);
  const gstAmount = gst?.rate ? taxableSubtotal.mul(new Decimal(gst.rate).div(100)) : new Decimal(gst?.amount ?? 0);
  const finalCost = taxableSubtotal.add(gstAmount);

  return {
    items: itemRows,
    charges: charges.map((charge) => ({
      ...charge,
      amount:
        charge.kind === "SCRAP"
          ? money(scrapCost).toString()
          : charge.kind === "TRANSPORT"
            ? money(transportCost).toString()
            : charge.kind === "GST"
              ? money(gstAmount).toString()
              : money(new Decimal(charge.amount ?? 0)).toString()
    })),
    totalQuantity: money(totalQuantity).toString(),
    baseCost: money(baseCost).toString(),
    scrapCost: money(scrapCost).toString(),
    transportCost: money(transportCost).toString(),
    gstAmount: money(gstAmount).toString(),
    additionalCost: money(additionalCost).toString(),
    finalCost: money(finalCost).toString()
  };
}
