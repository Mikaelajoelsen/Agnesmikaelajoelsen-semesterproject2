import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const getRandomImage = async () => {
  try {
    const response = await fetch("https://source.unsplash.com/random/800x600");
    return response.url;
  } catch (error) {
    console.warn("getRandomImage, error", error);
    return "";
  }
};

const ListingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 12;

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);

      try {
        const res = await fetch(
          "https://api.noroff.dev/api/v1/auction/listings"
        );
        const data = await res.json();

        const updatedListings = await Promise.all(
          data.map(async (item) => ({
            ...item,
            media: item?.media ? item.media : await getRandomImage(),
          }))
        );

        setListings(updatedListings);
        setFilteredListings(updatedListings);

        setIsLoading(false);
      } catch (error) {
        console.warn("fetchListings, error", error);
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = listings.filter((item) =>
      item.title.toLowerCase().startsWith(searchTerm)
    );

    setFilteredListings(filtered);
  };

  // Calculate the indexes for the current page
  const indexOfLastListing = currentPage * listingsPerPage;
  const indexOfFirstListing = indexOfLastListing - listingsPerPage;
  const currentListings = filteredListings.slice(
    indexOfFirstListing,
    indexOfLastListing
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="bg-white">
      <h1 className="flex justify-center mb-4 text-4xl font-thin text-black">
        All Listings
      </h1>
      <div className="flex justify-center mb-4">
        <input
          type="text"
          placeholder="Search item..."
          className="flex w-2/3 p-2 border border-gray-600 bg-inherit"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button
          className="flex font-thin text-black border-gray-600 rounded-none bg-inherit"
          onClick={() => console.log("Performing search for:", searchTerm)}
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
        {currentListings.map((item) => (
          <div
            key={item?.id}
            className="w-full max-w-xs overflow-hidden bg-white shadow-lg rounded-t-xl"
          >
            <Link
              className="item-link"
              to={`/listing/${item.id}?id=${item.id}`}
            >
              <div className="relative" style={{ paddingBottom: "100%" }}>
                {item?.media && (
                  <img
                    src={item?.media}
                    alt={item?.title}
                    className="absolute object-cover w-full h-full"
                    loading="lazy"
                    onError={async (e) => {
                      e.target.src = await getRandomImage();
                    }}
                  />
                )}
              </div>
              <div className="px-6 py-4 text-black">
                <h2 className="mb-2 text-xl font-bold">{item?.title}</h2>
                <p className="text-base text-gray-700">{item?.description}</p>
                <p className="text-base text-gray-700">
                  Ends at: {item?.endsAt}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4 mb-12">
        {filteredListings.length > listingsPerPage && (
          <div className="flex space-x-2">
            <button
              className="px-3 py-2 font-thin text-black border border-black rounded-full  bg-inherit"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {"Prev"}
            </button>
            <button
              className="px-3 py-2 font-thin text-black border border-black rounded-full  bg-inherit"
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLastListing >= filteredListings.length}
            >
              {"Next"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ListingsPage;
