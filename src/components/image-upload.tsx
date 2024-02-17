'use client';

import Image from 'next/image';

import { UploadButton } from '@/lib/uploadthing';

type ImageUploadProps = {
  value: string;
  onChange: (src: string) => void;
  disabled?: boolean;
};

export default function ImageUpload({
  value,
  onChange,
  disabled,
}: ImageUploadProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4">
      <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border-4 border-dashed border-primary/10 p-4 transition hover:opacity-75">
        <div className="relative h-40 w-40">
          <Image
            fill
            alt="uploade"
            src={!value || value === '' ? '/placeholder.svg' : value}
            className="rounded-lg object-cover"
          />
        </div>
      </div>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => onChange(res[0].url)}
      />
    </div>
  );
}
