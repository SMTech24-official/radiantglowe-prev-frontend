import jsPDF from 'jspdf';

interface SubscriptionInvoiceData {
  subscriptionDate: string;
  landlordName: string;
  landlordEmail: string;
  packageTitle: string;
  packageDescription: string;
  subscriptionAmount: string;
  amountPaid: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  transactionId?: string;
  isFreePromo?: boolean;
  freePromoText?: string;
}

export default function generateSubscriptionInvoicePDF(data: SubscriptionInvoiceData): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    // Colors
    const primaryColor = '#B07E50'; // Warm brown/gold
    const textColor = '#333333'; // Dark gray for main text
    const lightGray = '#E0D7CE'; // Light background for sections

    // Margins
    const marginLeft = 15;
    const pageWidth = 210; // A4 width in mm
    const contentWidth = pageWidth - marginLeft * 2;

    // Helper for currency formatting (assuming NGN)
    const formatCurrency = (amount: string) => {
      const num = Number(amount);
      if (isNaN(num)) return amount;
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(num);
    };

    // Add logo (skipped to avoid errors, assuming base64 or data URL in production)
    doc.addImage('/logo_main.png', 'PNG', marginLeft, 10, 25, 25);

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.setFontSize(24);
    doc.text('Subscription Invoice', pageWidth / 2, 25, { align: 'center' });

    // Generated Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    const generatedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
    const subscriptionDate = new Date(data.subscriptionDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
    doc.text(`Generated on: ${generatedDate}`, marginLeft, 35);
    doc.text(`Subscription Date: ${subscriptionDate}`, marginLeft, 42);

    // Section function to draw background and header
    function drawSection(title: string, yStart: number) {
      // Background rectangle
      doc.setFillColor(lightGray);
      doc.roundedRect(marginLeft - 2, yStart - 8, contentWidth + 4, 12, 2, 2, 'F');

      // Section title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.text(title, marginLeft, yStart);

      // Reset font for content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(textColor);
    }

    // Landlord Information
    drawSection('Landlord Information', 55);
    doc.text(`Name: ${data.landlordName}`, marginLeft, 65);
    doc.text(`Email: ${data.landlordEmail}`, marginLeft, 72);

    // Subscription Details
    drawSection('Subscription Details', 85);
    doc.text(`Package: ${data.packageTitle}`, marginLeft, 95);
    doc.text(`Description: ${data.packageDescription}`, marginLeft, 102);
    if (data.isFreePromo && data.freePromoText) {
      doc.text(`Promotion: ${data.freePromoText}`, marginLeft, 109);
    }
    doc.text(`Subscription Amount: ${formatCurrency(data.subscriptionAmount)}`, marginLeft, data.isFreePromo ? 116 : 109);

    // Payment Details
    drawSection('Payment Details', data.isFreePromo ? 130 : 123);
    doc.text(`Amount Paid: ${formatCurrency(data.amountPaid)}`, marginLeft, data.isFreePromo ? 140 : 133);
    doc.text(`Payment Method: ${data.paymentMethod}`, marginLeft, data.isFreePromo ? 147 : 140);
    doc.text(`Payment Status: ${data.paymentStatus}`, marginLeft, data.isFreePromo ? 154 : 147);
    doc.text(`Payment Date: ${data.paymentDate}`, marginLeft, data.isFreePromo ? 161 : 154);
    if (data.transactionId) {
      doc.text(`Transaction ID: ${data.transactionId}`, marginLeft, data.isFreePromo ? 168 : 161);
    }

    // Horizontal line above footer
    doc.setDrawColor(180, 126, 80); // Same as primaryColor but RGB
    doc.setLineWidth(0.7);
    doc.line(marginLeft, data.isFreePromo ? 185 : 178, pageWidth - marginLeft, data.isFreePromo ? 185 : 178);

    // Footer text
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.text('Thank you for your subscription!', pageWidth / 2, data.isFreePromo ? 195 : 188, { align: 'center' });
    doc.text('For inquiries, contact info@simpleroomsng.com', pageWidth / 2, data.isFreePromo ? 202 : 195, { align: 'center' });
    doc.text('Simple Rooms', pageWidth / 2, data.isFreePromo ? 209 : 202, { align: 'center' });

    // Page number footer
    doc.setTextColor(textColor);
    doc.setFontSize(9);
    doc.text(`Page 1 of 1`, pageWidth - marginLeft, 297, { align: 'right' });

    // Save PDF
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    doc.save(`subscription_invoice_${timestamp}.pdf`);
  } catch (error) {
    console.error('Error generating subscription invoice:', error);
  }
}