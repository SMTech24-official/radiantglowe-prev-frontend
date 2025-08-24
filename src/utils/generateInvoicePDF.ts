/* eslint-disable @typescript-eslint/no-unused-vars */
import jsPDF from 'jspdf';

interface InvoiceData {
  bookingDate: string;
  tenantName: string;
  tenantEmail: string;
  landlordName: string;
  landlordEmail: string;
  propertyHeadline: string;
  propertyAddress: string;
  rentAmount: string;
  amountPaid: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
}

export default function generateInvoicePDF(data: InvoiceData): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
    });

    // Colors
    const primaryColor = '#B07E50'; // Your accent color (warm brown/gold)
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

    // Add logo - assuming you have base64 or image data URL for production, here we just skip adding image to avoid errors
    doc.addImage('/logo_main.png', 'PNG', marginLeft, 10, 25, 25);

    // Header Title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.setFontSize(24);
    doc.text('Property Booking Invoice', pageWidth / 2, 25, { align: 'center' });

    // Generated Date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(textColor);
    const generatedDate = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
    doc.text(`Generated on: ${generatedDate}`, marginLeft, 35);
    doc.text(`Booking Date: ${data.bookingDate}`, marginLeft, 42);

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

    // Tenant Information
    drawSection('Tenant Information', 55);
    doc.text(`Name: ${data.tenantName}`, marginLeft, 65);
    doc.text(`Email: ${data.tenantEmail}`, marginLeft, 72);

    // Landlord Information
    drawSection('Landlord Information', 85);
    doc.text(`Name: ${data.landlordName}`, marginLeft, 95);
    doc.text(`Email: ${data.landlordEmail}`, marginLeft, 102);

    // Property Details
    drawSection('Property Details', 115);
    doc.text(`Headline: ${data.propertyHeadline}`, marginLeft, 125);
    doc.text(`Address: ${data.propertyAddress}`, marginLeft, 132);
    doc.text(`Rent Amount: ${formatCurrency(data.rentAmount)}`, marginLeft, 139);

    // Payment Details
    drawSection('Payment Details', 150);
    doc.text(`Amount Paid: ${formatCurrency(data.amountPaid)}`, marginLeft, 160);
    doc.text(`Payment Method: ${data.paymentMethod}`, marginLeft, 167);
    doc.text(`Payment Status: ${data.paymentStatus}`, marginLeft, 174);
    doc.text(`Payment Date: ${data.paymentDate}`, marginLeft, 181);

    // Horizontal line above footer
    doc.setDrawColor(180, 126, 80); // same as primaryColor but rgb
    doc.setLineWidth(0.7);
    doc.line(marginLeft, 200, pageWidth - marginLeft, 200);

    // Footer text
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.text('Please complete the payment as per the agreed terms.', pageWidth / 2, 210, { align: 'center' });
    doc.text('For inquiries, contact info@simpleroomsng.com', pageWidth / 2, 217, { align: 'center' });
    doc.text('Simple Rooms', pageWidth / 2, 224, { align: 'center' });

    // Optional: Page number footer
    doc.setTextColor(textColor);
    doc.setFontSize(9);
    doc.text(`Page 1 of 1`, pageWidth - marginLeft, 297, { align: 'right' });

    // Save PDF
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    doc.save(`invoice_${timestamp}.pdf`);
  } catch (error) {

  }
}
