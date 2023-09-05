import { useState } from "react";
import axios from "axios";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HiMagnifyingGlass } from "react-icons/hi2";
import { CalendarIcon } from "lucide-react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FormSchema = z.object({
  location: z.string({ required_error: "A location is required." }),
  date: z.date({
    required_error: "A date is required.",
  }),
});

export default function SpotTracksForm({
  onStoriesSearch,
  setLoading,
  setError,
  setSearchNoMatch,
  locationsData,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const form = useForm({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data) {
    data.date = format(data.date, "dd-MM-yyyy");

    setLoading(true);

    console.log(data);
    console.log("searching tracks...");

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}location_songs`, data)
      .then((response) => {
        console.log("Searched successfully.");
        if (response.data.length !== 0) {
          onStoriesSearch(response.data);
        } else {
          setSearchNoMatch("No stories were found.");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError(error.message);
        setLoading(false);
      });
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col justify-center items-center gap-4 p-10'
        >
          <h2 className='text-3xl lg:text-4xl mb-4 text-white font-thin'>
            <span className='text-bpmPink'>Spot.</span> your tracks
          </h2>
          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          "w-[90vw] max-w-[300px] min-w-[250px] justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? locationsData.find(
                              (location) => location.name === field.value
                            )?.name
                          : "Pick a Location"}
                        <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[90vw] max-w-[300px] min-w-[250px] p-0'>
                    <Command>
                      <CommandInput
                        placeholder='Search Location...'
                        className='h-9'
                      />
                      <CommandEmpty>No Locations found.</CommandEmpty>
                      <CommandGroup>
                        {locationsData.map((location, i) => (
                          <CommandItem
                            value={location.name}
                            key={i}
                            onSelect={() => {
                              setSelectedLocation(location.name);
                              form.setValue("location", location.name);
                            }}
                          >
                            {location.name}
                            <CheckIcon
                              className={cn(
                                "ml-auto h-4 w-4",
                                location.name === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='date'
            render={({ field }) => (
              <FormItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[90vw] max-w-[300px] min-w-[250px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      className='w-[90vw] max-w-[300px] min-w-[250px] flex justify-center items-center'
                      mode='single'
                      selected={field.value}
                      onSelect={(selectDate) => {
                        setSelectedDate(selectDate);
                        field.onChange(selectDate);
                      }}
                      disabled={(date) => {
                        const selectedLocationData = locationsData.find(
                          (location) => location.name === selectedLocation
                        );

                        if (selectedLocationData) {
                          const isDateDisabled =
                            !selectedLocationData.location_dates.some(
                              (locationDate) => {
                                const locationDateObj = new Date(locationDate);
                                return (
                                  date.getFullYear() ===
                                    locationDateObj.getFullYear() &&
                                  date.getMonth() ===
                                    locationDateObj.getMonth() &&
                                  date.getDate() === locationDateObj.getDate()
                                );
                              }
                            );

                          return isDateDisabled;
                        }

                        return date;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription className='ml-1'>
                  Enter the date you want to Spot.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={!selectedLocation || !selectedDate}
            type='submit'
            className='mt-2 gap-2'
            size='lg'
          >
            Search
            <HiMagnifyingGlass className='text-lg ' />
          </Button>
        </form>
      </Form>
    </>
  );
}
