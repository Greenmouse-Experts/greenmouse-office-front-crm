// Dummy data for attachment items. Replace imageSrc with actual paths if available.
const attachments = [
  {
    id: 1,
    title: "Profile Photo",
    imageSrc: "https://picsum.photos/id/1025/300/170", // Example placeholder image for profile photo
    createdDate: "6/11/2018",
  },
  {
    id: 2,
    title: "Merchant Mariner",
    imageSrc: "https://picsum.photos/id/1/300/170", // Example placeholder image for a document
    createdDate: "6/11/2018",
  },
  {
    id: 3,
    title: "Driver License",
    imageSrc: "https://picsum.photos/id/1047/300/170", // Example placeholder image for an ID card
    createdDate: "6/11/2018",
  },
  {
    id: 4,
    title: "TWIC",
    imageSrc: "https://picsum.photos/id/1012/300/170", // Example placeholder image for another ID card
    createdDate: "6/11/2018",
  },
];

export default function OtherInfo() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Attachments</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="card bg-base-100 shadow-xl overflow-hidden"
          >
            <figure className="relative w-full h-40">
              <img
                src={attachment.imageSrc}
                alt={attachment.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </figure>
            <div className="card-body p-4">
              <h3 className="card-title text-base font-semibold mb-1">
                {attachment.title}
              </h3>
              <p className="text-sm text-gray-500">
                Created {attachment.createdDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
