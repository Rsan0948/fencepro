const PRIMARY = "#e8c547";
const SURFACE = "#ffffff";
const PAGE = "#f5f5f0";
const TEXT = "#1a1a2e";
const MUTED = "#6b7280";
const BORDER = "#eaeaea";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(body: string): string {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${PAGE}; padding: 40px 16px; color: ${TEXT};">
  <div style="max-width: 520px; margin: 0 auto; background: ${SURFACE}; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
${body}
  </div>
</div>`;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface EstimateSentInput {
  clientName: string;
  companyName: string;
  totalAmount: string;
  depositAmount: string;
  checkoutUrl: string;
}

export function renderEstimateSent(input: EstimateSentInput): RenderedEmail {
  const safeClient = escapeHtml(input.clientName);
  const safeCompany = escapeHtml(input.companyName);
  const safeTotal = escapeHtml(input.totalAmount);
  const safeDeposit = escapeHtml(input.depositAmount);
  const safeUrl = escapeHtml(input.checkoutUrl);
  const body = `    <div style="font-size: 11px; letter-spacing: 0.18em; color: ${MUTED}; text-transform: uppercase; margin-bottom: 12px;">Estimate</div>
    <h1 style="font-size: 22px; margin: 0 0 16px; color: ${TEXT};">Hi ${safeClient}, here's your estimate</h1>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: ${TEXT};">We've prepared the numbers for your project. To get started, pay the deposit below and we'll begin work on your scheduled date.</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; color: ${MUTED};">Project total</td><td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; text-align: right;">${safeTotal}</td></tr>
      <tr><td style="padding: 10px 0; font-size: 14px; color: ${TEXT}; font-weight: 600;">Deposit due now</td><td style="padding: 10px 0; font-size: 16px; text-align: right; font-weight: 700; color: ${TEXT};">${safeDeposit}</td></tr>
    </table>
    <a href="${safeUrl}" style="display: inline-block; background: ${PRIMARY}; color: ${TEXT}; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Pay deposit</a>
    <p style="font-size: 12px; color: ${MUTED}; margin: 28px 0 0;">Questions? Just reply to this email.</p>
    <p style="font-size: 12px; color: ${MUTED}; margin: 4px 0 0;">— ${safeCompany}</p>`;
  return {
    subject: `Your estimate from ${input.companyName}`,
    html: shell(body),
    text: `Hi ${input.clientName},\n\nWe've prepared an estimate for your project. Project total: ${input.totalAmount}. To get started, pay the deposit of ${input.depositAmount}: ${input.checkoutUrl}\n\n— ${input.companyName}`,
  };
}

export interface FinalInvoiceInput {
  clientName: string;
  companyName: string;
  totalAmount: string;
  depositPaid: string;
  remainingAmount: string;
  checkoutUrl: string;
}

export function renderFinalInvoice(input: FinalInvoiceInput): RenderedEmail {
  const safeClient = escapeHtml(input.clientName);
  const safeCompany = escapeHtml(input.companyName);
  const safeTotal = escapeHtml(input.totalAmount);
  const safeDeposit = escapeHtml(input.depositPaid);
  const safeRemaining = escapeHtml(input.remainingAmount);
  const safeUrl = escapeHtml(input.checkoutUrl);
  const body = `    <div style="font-size: 11px; letter-spacing: 0.18em; color: ${MUTED}; text-transform: uppercase; margin-bottom: 12px;">Final invoice</div>
    <h1 style="font-size: 22px; margin: 0 0 16px; color: ${TEXT};">Hi ${safeClient}, your project is complete</h1>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: ${TEXT};">Thanks for working with us. The remaining balance is ready for payment whenever you are.</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; color: ${MUTED};">Project total</td><td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; text-align: right;">${safeTotal}</td></tr>
      <tr><td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; color: ${MUTED};">Deposit already paid</td><td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; text-align: right;">− ${safeDeposit}</td></tr>
      <tr><td style="padding: 10px 0; font-size: 14px; color: ${TEXT}; font-weight: 600;">Remaining balance</td><td style="padding: 10px 0; font-size: 18px; text-align: right; font-weight: 700; color: ${TEXT};">${safeRemaining}</td></tr>
    </table>
    <a href="${safeUrl}" style="display: inline-block; background: ${PRIMARY}; color: ${TEXT}; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Pay remaining balance</a>
    <p style="font-size: 12px; color: ${MUTED}; margin: 28px 0 0;">— ${safeCompany}</p>`;
  return {
    subject: `Final invoice from ${input.companyName}`,
    html: shell(body),
    text: `Hi ${input.clientName},\n\nThanks for working with us. Your project is complete. Total: ${input.totalAmount}, deposit already paid: ${input.depositPaid}, remaining: ${input.remainingAmount}. Pay here: ${input.checkoutUrl}\n\n— ${input.companyName}`,
  };
}

export interface PaymentReceiptInput {
  clientName: string;
  companyName: string;
  amountPaid: string;
  paymentLabel: string;
}

export function renderPaymentReceipt(input: PaymentReceiptInput): RenderedEmail {
  const safeClient = escapeHtml(input.clientName);
  const safeCompany = escapeHtml(input.companyName);
  const safeAmount = escapeHtml(input.amountPaid);
  const safeLabel = escapeHtml(input.paymentLabel);
  const body = `    <div style="font-size: 11px; letter-spacing: 0.18em; color: ${MUTED}; text-transform: uppercase; margin-bottom: 12px;">Receipt</div>
    <h1 style="font-size: 22px; margin: 0 0 16px; color: ${TEXT};">Hi ${safeClient}, we received your payment</h1>
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: ${TEXT};">Your ${safeLabel} of <strong>${safeAmount}</strong> has been recorded. Keep this email for your records.</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr><td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; color: ${MUTED};">Payment</td><td style="padding: 10px 0; border-bottom: 1px solid ${BORDER}; font-size: 14px; text-align: right;">${safeLabel}</td></tr>
      <tr><td style="padding: 10px 0; font-size: 14px; color: ${TEXT}; font-weight: 600;">Amount</td><td style="padding: 10px 0; font-size: 16px; text-align: right; font-weight: 700;">${safeAmount}</td></tr>
    </table>
    <p style="font-size: 12px; color: ${MUTED}; margin: 4px 0 0;">— ${safeCompany}</p>`;
  return {
    subject: `Receipt: ${input.paymentLabel} from ${input.companyName}`,
    html: shell(body),
    text: `Hi ${input.clientName},\n\nWe received your ${input.paymentLabel} of ${input.amountPaid}. Keep this email for your records.\n\n— ${input.companyName}`,
  };
}
