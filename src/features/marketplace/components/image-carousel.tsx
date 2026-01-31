import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@marketplace/components/ui/carousel";


export function ImageCarousel({ images }: { images: string[] }) {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent className="-mt-1 object-cover h-[300px] lg:h-[350px]">
        {images?.map((image, index) => (
          <CarouselItem
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index}
            className="flex justify-center items-center h-full w-full rounded-md"
          >
            <img
              src={image || "/marketplace/logo.svg"}
              alt="Product image"
              className="w-full h-full object-contain rounded-md"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
