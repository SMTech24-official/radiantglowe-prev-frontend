import Image from 'next/image';

import coins from "@/assets/packages/coins.png"

export default function NoCommission() {
  return (
    <div className="flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="max-w-5xl mx-auto bg-primary rounded-xl p-6 flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <Image
            src={coins} 
            alt="Coins"
            width={400}
            height={400}
            className="rounded-lg object-cover"
          />
        </div>
        <div className="w-full md:w-2/3 text-center md:text-left md:pl-4">
          <h2 className="text-3xl font-bold text-white mb-4">No Hidden fees and no Commission</h2>
          <p className="text-white text-sm">Our services come with no additional charges or commissions - you only pay a clear and competitive price for the services you need.</p>
        </div>
      </div>
    </div>
  );
}