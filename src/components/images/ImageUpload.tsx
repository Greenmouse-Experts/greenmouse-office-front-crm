import { XCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

export default function ImageUpload({
  image,
  setNew,
  setPrev,
}: {
  image: { url: string; path: string } | undefined;
  setNew: (item: any) => any;
  setPrev: (item: any) => any;
}) {
  const id = nanoid();
  const [prevImage, setPrevImage] = useState<
    { url: string; path: string } | undefined
  >(image);
  useEffect(() => {
    setPrevImage(image);
  }, [image]);
  const [newImage, setNewImage] = useState<File | undefined>(undefined);
  useEffect(() => {
    if (newImage) {
      setNew(newImage);
    } else {
      setNew(undefined);
    }
  }, [newImage, setNew]);

  return (
    <div className="space-y-4">
      <div className="grid  gap-4">
        <div className="h-40 flex flex-col justify-center items-center border-2 border-dashed border-base-300 rounded-lg p-4 hover:border-primary transition-colors duration-200">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            name=""
            id={id}
            onChange={(e) => {
              const file = e.target.files?.[0];
              setNewImage(file);
            }}
          />
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center text-center cursor-pointer h-full w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-base-content opacity-60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="mt-2 text-lg font-semibold text-base-content opacity-80">
              Upload Image
            </span>
            <span className="text-sm text-base-content opacity-60">
              Drag and drop or click to upload
            </span>
          </label>
        </div>
        {prevImage && (
          <div key={prevImage.path} className="relative h-40 w-full group">
            <img
              className="size-full object-cover rounded-lg shadow-md"
              src={prevImage.url}
              alt={`Existing image`}
            />
            <button
              type="button"
              className="btn btn-circle btn-error btn-sm absolute -right-2 -top-2 m-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => {
                setPrevImage(undefined);
                setPrev(undefined);
              }}
              aria-label="Remove existing image"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {newImage && (
          <div key={newImage.name} className="relative h-40 w-full group">
            <img
              className="size-full object-cover rounded-lg shadow-md"
              src={URL.createObjectURL(newImage)}
              alt={`New image`}
            />
            <button
              type="button"
              className="btn btn-circle btn-error btn-sm absolute -right-2 -top-2 m-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => {
                setNewImage(undefined);
              }}
              aria-label="Remove new image"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
