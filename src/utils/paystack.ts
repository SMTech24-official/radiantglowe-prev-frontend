// "use server";

// import { randomUUID } from 'crypto'; // Node.js v14.17+
// import { Paystack } from 'paystack-sdk';

// export async function initializePaystackTransaction({
//   email,
//   amount,
//   landlordId,
//   propertyId,
//   tenantId,
//   packageId,
//   type
// }: {
//   email: string;
//   amount: number;
//   landlordId?: string;
//   propertyId?: string;
//   tenantId?: string;
//   packageId?: string
//   type?: string
// }) {

//   const paystack = new Paystack(process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY as string);

//   try {
//     // const reference = `sub_${randomUUID()}_${Math.random().toString(36).substring(2, 8)}_${Date.now()}`;

//     const transaction = await paystack.transaction.initialize({
//       email,
//       amount: Math.round(amount * 100).toString(),
//       currency: 'NGN',
//       metadata: {
//         landlordId,
//         propertyId,
//         tenantId,
//         packageId,
//         type
//       },
//     });

//     if (!transaction?.data?.reference) {
//       throw new Error('Transaction reference not found');
//     }

//     return { reference, transaction };
//   } catch (error) {
//     console.error('Paystack initialization error:', error);
//     throw new Error('Failed to initialize transaction');
//   }
// }
