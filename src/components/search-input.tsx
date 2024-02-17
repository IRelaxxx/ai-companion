'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';
import { type ChangeEventHandler, useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryId = searchParams.get('categoryId');
  const name = searchParams.get('name');

  const [value, setValue] = useState(name ?? '');
  const debouncedValue = useDebounce(value, 500);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    const query = {
      name: debouncedValue,
      categoryId: categoryId,
    };

    const url = qs.stringifyUrl(
      {
        url: window.location.href,
        query,
      },
      { skipEmptyString: true, skipNull: true },
    );

    router.push(url);
  }, [categoryId, debouncedValue, router]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        onChange={onChange}
        value={value}
        placeholder="Search..."
        className="bg-primary/10 pl-10"
      />
    </div>
  );
}
