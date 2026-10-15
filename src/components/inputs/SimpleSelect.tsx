import apiClient, { type ApiResponse } from "@/client/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";

interface SimpleSelect<T> extends PropsWithChildren {
  route: string;
  value: any;
  onChange: (value: string) => void;
  label?: string;
  render: (item: T, index: number) => any;
}

export default function SimpleSelect<T>(props: SimpleSelect<T>) {
  const [internalValue, setInternalValue] = useState(props.value);
  const query = useQuery<ApiResponse>({
    queryKey: ["select", props.route],
    queryFn: async () => {
      const response = await apiClient.get(`${props.route}`, {
        params: {
          limit: 50,
        },
      });
      return response.data;
    },
  });

  useEffect(() => {
    if (internalValue !== props.value) {
      if (props.onChange) {
        props.onChange(internalValue);
      }
    }
  }, [internalValue]);

  const label = props.label;
  if (query.isLoading)
    return (
      <div className="w-full">
        {label && (
          <label htmlFor="" className="mb-2 fieldset-label">
            {label}
          </label>
        )}
        <select disabled name="" className="select w-full" id="">
          <option value="">Loading</option>
        </select>
      </div>
    );

  if (query.isError)
    return (
      <div className="w-full ">
        {label && (
          <label htmlFor="" className="mb-2 fieldset-label">
            {label}
          </label>
        )}
        <select disabled name="" className="select w-full" id="">
          <option value="">Error loading options</option>
        </select>
      </div>
    );

  const items: T[] = query.data?.payload ?? [];

  return (
    <div className="w-full">
      {label && (
        <label htmlFor="" className="mb-2 fieldset-label">
          {label}
        </label>
      )}
      <select
        value={internalValue}
        onChange={(e) => {
          // console.log(e.target.value);
          setInternalValue(e.target.value);
        }}
        className="select w-full"
      >
        {items.map((item, idx) => props.render(item, idx))}
        <>
          <option value="null">All </option>
        </>
      </select>
    </div>
  );
}
