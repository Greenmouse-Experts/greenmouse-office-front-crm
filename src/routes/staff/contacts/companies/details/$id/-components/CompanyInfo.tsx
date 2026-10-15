export default function CompanyInfo() {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start px-8 py-8 bg-white shadow-lg rounded-xl gap-8">
      <figure className="w-36 h-36 rounded-full overflow-hidden shrink-0 ring-4 ring-blue-500 ring-offset-2">
        <img
          src="https://github.com/shadcn.png" // Replace with the actual path to the image
          alt="Amber Leary"
          className="object-cover w-full h-full"
        />
      </figure>
      <div className="card-body p-0 text-center sm:text-left">
        <h2 className="card-title text-3xl font-semibold text-gray-900 mb-2">
          Acme Corporation
        </h2>
        <p className="text-lg text-blue-600 mb-2">FinTech</p>
        <div className="space-y-3 text-base ">
          <div className="flex items-center">
            <div className="font-medium text-gray-500 w-36 shrink-0">
              Date Joined
            </div>
            <div className="text-gray-800">06/16/1988</div>
          </div>
          <div className="flex items-center">
            <div className="font-medium text-gray-500 w-36 shrink-0">
              Work Phone
            </div>
            <div className="text-gray-800">555-221-1011</div>
          </div>
          <div className="flex items-center">
            <div className="font-medium text-gray-500 w-36 shrink-0">Email</div>
            <div className="text-blue-500 hover:underline cursor-pointer break-all">
              clear@emailprovider.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
