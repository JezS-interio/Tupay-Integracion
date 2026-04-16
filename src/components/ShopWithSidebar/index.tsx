"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import CategoryDropdown from "./CategoryDropdown";
import { fetchAllProducts, fetchProductsByCategory, getCategoryCounts } from "@/lib/firebase/products";
import { FirestoreProduct } from "@/types/product";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";

const ShopWithSidebar = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 0
  ]);
  const [sortBy, setSortBy] = useState("relevant");
  const itemsPerPage = 12;

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  // Filter products by search query
  const filterProductsBySearch = (products: FirestoreProduct[]) => {
    if (!searchQuery) return products;

    const query = searchQuery.toLowerCase();
    return products.filter((product) => {
      const titleMatch = product.title.toLowerCase().includes(query);
      const descriptionMatch = product.description?.toLowerCase().includes(query);
      const brandMatch = product.brand?.toLowerCase().includes(query);
      const categoryMatch = product.category?.toLowerCase().includes(query);

      return titleMatch || descriptionMatch || brandMatch || categoryMatch;
    });
  };

  // Filter products by price range (only if user has set a filter)
  const filterProductsByPrice = (products: FirestoreProduct[]) => {
    // Only apply filter if user has actually set min or max price via URL params
    const hasMinPrice = minPrice !== null;
    const hasMaxPrice = maxPrice !== null;

    if (!hasMinPrice && !hasMaxPrice) {
      return products; // No filter applied, show all products
    }

    return products.filter((product) => {
      const price = product.discountedPrice || product.price;
      const minPriceValue = hasMinPrice ? parseInt(minPrice!) : 0;
      const maxPriceValue = hasMaxPrice ? parseInt(maxPrice!) : Infinity;
      return price >= minPriceValue && price <= maxPriceValue;
    });
  };

  // Handle price input change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value);
    setPriceRange([value, priceRange[1]]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value);
    setPriceRange([priceRange[0], value]);
  };

  // Apply price filter
  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Only add params if user has entered values
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (priceRange[1] > 0) {
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }

    router.push(`/shop-with-sidebar?${params.toString()}`);
  };

  // Clear price filter
  const clearPriceFilter = () => {
    setPriceRange([0, 0]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    router.push(`/shop-with-sidebar?${params.toString()}`);
  };

  // Sort products
  const sortProducts = (products: FirestoreProduct[]) => {
    const sorted = [...products];

    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => {
          const priceA = a.discountedPrice || a.price;
          const priceB = b.discountedPrice || b.price;
          return priceA - priceB;
        });
      case "price-desc":
        return sorted.sort((a, b) => {
          const priceA = a.discountedPrice || a.price;
          const priceB = b.discountedPrice || b.price;
          return priceB - priceA;
        });
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "name-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  };

  // Category mapping - now using direct category names from DummyJSON
  const categoryMapping: { [key: string]: string } = {};

  const categories = [
    {
      name: "Smartphones",
      displayName: "Teléfonos",
      products: categoryCounts["Smartphones"] || 0,
      isRefined: false,
    },
    {
      name: "Computers",
      displayName: "Computadoras",
      products: categoryCounts["Computers"] || 0,
      isRefined: false,
    },
    {
      name: "Tablets",
      displayName: "Tabletas",
      products: categoryCounts["Tablets"] || 0,
      isRefined: false,
    },
    {
      name: "Wearables",
      displayName: "Vestibles",
      products: categoryCounts["Wearables"] || 0,
      isRefined: false,
    },
    {
      name: "Accessories",
      displayName: "Accesorios",
      products: categoryCounts["Accessories"] || 0,
      isRefined: false,
    },
    {
      name: "Electronics",
      displayName: "Electrónica",
      products: categoryCounts["Electronics"] || 0,
      isRefined: false,
    },
  ].map((category) => ({
    ...category,
    isRefined:
      selectedCategory &&
      (category.name === selectedCategory ||
        category.name === categoryMapping[selectedCategory]),
  }));

  // Fetch category counts on mount
  useEffect(() => {
    const loadCategoryCounts = async () => {
      const counts = await getCategoryCounts();
      setCategoryCounts(counts);
    };
    loadCategoryCounts();
  }, []);

  // Fetch products (filtered by category if selected)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Filtrar por category if one is selected, otherwise show all products
        const data = selectedCategory
          ? await fetchProductsByCategory(selectedCategory)
          : await fetchAllProducts();
        setProducts(data);
        setCurrentPage(1); // Reset to first page when category changes
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory]);

  // Sync search input with URL and reset pagination when search changes
  useEffect(() => {
    setSearchInput(searchQuery);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchQuery]);

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    // closing sidebar while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  // Apply search filter to products
  let filteredProducts = filterProductsBySearch(products);

  // Apply price filter
  filteredProducts = filterProductsByPrice(filteredProducts);

  // Apply sorting
  filteredProducts = sortProducts(filteredProducts);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }

    router.push(`/shop-with-sidebar?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/shop-with-sidebar?${params.toString()}`);
  };

  return (
    <>
      <Breadcrumb
        title={"Explorar Todos los Productos"}
        pages={["Tienda"]}
      />
      <section className="overflow-hidden relative pb-20 pt-3 lg:pt-5 xl:pt-6 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
                productSidebar
                  ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto"
                  : "-translate-x-full"
              }`}
            >
              <button
                onClick={() => setProductSidebar(!productSidebar)}
                aria-label="button for product sidebar toggle"
                className={`xl:hidden absolute -right-12.5 sm:-right-8 flex items-center justify-center w-8 h-8 rounded-md bg-white shadow-1 ${
                  stickyMenu
                    ? "lg:top-20 sm:top-34.5 top-35"
                    : "lg:top-24 sm:top-39 top-37"
                }`}
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.0068 3.44714C10.3121 3.72703 10.3328 4.20146 10.0529 4.5068L5.70494 9.25H20C20.4142 9.25 20.75 9.58579 20.75 10C20.75 10.4142 20.4142 10.75 20 10.75H4.00002C3.70259 10.75 3.43327 10.5742 3.3135 10.302C3.19374 10.0298 3.24617 9.71246 3.44715 9.49321L8.94715 3.49321C9.22704 3.18787 9.70147 3.16724 10.0068 3.44714Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.6865 13.698C20.5668 13.4258 20.2974 13.25 20 13.25L4.00001 13.25C3.5858 13.25 3.25001 13.5858 3.25001 14C3.25001 14.4142 3.5858 14.75 4.00001 14.75L18.2951 14.75L13.9472 19.4932C13.6673 19.7985 13.6879 20.273 13.9932 20.5529C14.2986 20.8328 14.773 20.8121 15.0529 20.5068L20.5529 14.5068C20.7539 14.2876 20.8063 13.9703 20.6865 13.698Z"
                    fill=""
                  />
                </svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  {/* <!-- category box --> */}
                  <CategoryDropdown categories={categories} />
                </div>
              </form>
            </div>
            {/* // <!-- Sidebar End --> */}

            {/* // <!-- Content Start --> */}
            <div className="xl:max-w-[870px] w-full">
              {/* <!-- Search Bar with View Toggle --> */}
              <div className="rounded-lg bg-white shadow-1 px-4 py-3 mb-4">
                <div className="flex items-start gap-3">
                  <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search products by name, brand, category..."
                        className="w-full rounded-md border border-gray-3 bg-gray-1 py-2.5 pl-10 pr-4 text-dark placeholder:text-gray-5 focus:border-blue focus:outline-none"
                      />
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 fill-gray-5"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.16667 3.33333C5.94501 3.33333 3.33333 5.94501 3.33333 9.16667C3.33333 12.3883 5.94501 15 9.16667 15C12.3883 15 15 12.3883 15 9.16667C15 5.94501 12.3883 3.33333 9.16667 3.33333ZM1.66667 9.16667C1.66667 5.02453 5.02453 1.66667 9.16667 1.66667C13.3088 1.66667 16.6667 5.02453 16.6667 9.16667C16.6667 13.3088 13.3088 16.6667 9.16667 16.6667C5.02453 16.6667 1.66667 13.3088 1.66667 9.16667Z"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4643 13.2857L18.0893 16.9107C18.4147 17.2362 18.4147 17.7638 18.0893 18.0893C17.7638 18.4147 17.2362 18.4147 16.9107 18.0893L13.2857 14.4643C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                        />
                      </svg>
                    </div>
                    <button
                      type="submit"
                      className="rounded-md bg-blue px-6 py-2.5 text-white hover:bg-opacity-90 transition-all"
                    >
                      Search
                    </button>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="rounded-md border border-gray-3 px-4 py-2.5 text-dark hover:bg-gray-1 transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </form>

                  {/* View Toggle */}
                  <div className="flex items-center gap-2 border border-gray-3 rounded-lg p-1.5">
                    <button
                      onClick={() => setProductStyle("grid")}
                      aria-label="button for product grid tab"
                      className={`${
                        productStyle === "grid"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-white border-transparent"
                      } flex items-center justify-center w-9 h-9 rounded border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.836 1.3125C4.16215 1.31248 3.60022 1.31246 3.15414 1.37244C2.6833 1.43574 2.2582 1.57499 1.91659 1.91659C1.57499 2.2582 1.43574 2.6833 1.37244 3.15414C1.31246 3.60022 1.31248 4.16213 1.3125 4.83598V4.914C1.31248 5.58785 1.31246 6.14978 1.37244 6.59586C1.43574 7.06671 1.57499 7.49181 1.91659 7.83341C2.2582 8.17501 2.6833 8.31427 3.15414 8.37757C3.60022 8.43754 4.16213 8.43752 4.83598 8.4375H4.914C5.58785 8.43752 6.14978 8.43754 6.59586 8.37757C7.06671 8.31427 7.49181 8.17501 7.83341 7.83341C8.17501 7.49181 8.31427 7.06671 8.37757 6.59586C8.43754 6.14978 8.43752 5.58787 8.4375 4.91402V4.83601C8.43752 4.16216 8.43754 3.60022 8.37757 3.15414C8.31427 2.6833 8.17501 2.2582 7.83341 1.91659C7.49181 1.57499 7.06671 1.43574 6.59586 1.37244C6.14978 1.31246 5.58787 1.31248 4.91402 1.3125H4.836ZM2.71209 2.71209C2.80983 2.61435 2.95795 2.53394 3.30405 2.4874C3.66632 2.4387 4.15199 2.4375 4.875 2.4375C5.59801 2.4375 6.08368 2.4387 6.44596 2.4874C6.79205 2.53394 6.94018 2.61435 7.03791 2.71209C7.13565 2.80983 7.21607 2.95795 7.2626 3.30405C7.31131 3.66632 7.3125 4.15199 7.3125 4.875C7.3125 5.59801 7.31131 6.08368 7.2626 6.44596C7.21607 6.79205 7.13565 6.94018 7.03791 7.03791C6.94018 7.13565 6.79205 7.21607 6.44596 7.2626C6.08368 7.31131 5.59801 7.3125 4.875 7.3125C4.15199 7.3125 3.66632 7.31131 3.30405 7.2626C2.95795 7.21607 2.80983 7.13565 2.71209 7.03791C2.61435 6.94018 2.53394 6.79205 2.4874 6.44596C2.4387 6.08368 2.4375 5.59801 2.4375 4.875C2.4375 4.15199 2.4387 3.66632 2.4874 3.30405C2.53394 2.95795 2.61435 2.80983 2.71209 2.71209Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.086 9.5625C12.4121 9.56248 11.8502 9.56246 11.4041 9.62244C10.9333 9.68574 10.5082 9.82499 10.1666 10.1666C9.82499 10.5082 9.68574 10.9333 9.62244 11.4041C9.56246 11.8502 9.56248 12.4121 9.5625 13.086V13.164C9.56248 13.8379 9.56246 14.3998 9.62244 14.8459C9.68574 15.3167 9.82499 15.7418 10.1666 16.0834C10.5082 16.425 10.9333 16.5643 11.4041 16.6276C11.8502 16.6875 12.4121 16.6875 13.0859 16.6875H13.164C13.8378 16.6875 14.3998 16.6875 14.8459 16.6276C15.3167 16.5643 15.7418 16.425 16.0834 16.0834C16.425 15.7418 16.5643 15.3167 16.6276 14.8459C16.6875 14.3998 16.6875 13.8379 16.6875 13.1641V13.086C16.6875 12.4122 16.6875 11.8502 16.6276 11.4041C16.5643 10.9333 16.425 10.5082 16.0834 10.1666C15.7418 9.82499 15.3167 9.68574 14.8459 9.62244C14.3998 9.56246 13.8379 9.56248 13.164 9.5625H13.086ZM10.9621 10.9621C11.0598 10.8644 11.208 10.7839 11.554 10.7374C11.9163 10.6887 12.402 10.6875 13.125 10.6875C13.848 10.6875 14.3337 10.6887 14.696 10.7374C15.0421 10.7839 15.1902 10.8644 15.2879 10.9621C15.3857 11.0598 15.4661 11.208 15.5126 11.554C15.5613 11.9163 15.5625 12.402 15.5625 13.125C15.5625 13.848 15.5613 14.3337 15.5126 14.696C15.4661 15.0421 15.3857 15.1902 15.2879 15.2879C15.1902 15.3857 15.0421 15.4661 14.696 15.5126C14.3337 15.5613 13.848 15.5625 13.125 15.5625C12.402 15.5625 11.9163 15.5613 11.554 15.5126C11.208 15.4661 11.0598 15.3857 10.9621 15.2879C10.8644 15.1902 10.7839 15.0421 10.7374 14.696C10.6887 14.3337 10.6875 13.848 10.6875 13.125C10.6875 12.402 10.6887 11.9163 10.7374 11.554C10.7839 11.208 10.8644 11.0598 10.9621 10.9621Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M4.836 9.5625H4.914C5.58786 9.56248 6.14978 9.56246 6.59586 9.62244C7.06671 9.68574 7.49181 9.82499 7.83341 10.1666C8.17501 10.5082 8.31427 10.9333 8.37757 11.4041C8.43754 11.8502 8.43752 12.4121 8.4375 13.086V13.164C8.43752 13.8378 8.43754 14.3998 8.37757 14.8459C8.31427 15.3167 8.17501 15.7418 7.83341 16.0834C7.49181 16.425 7.06671 16.5643 6.59586 16.6276C6.14979 16.6875 5.58789 16.6875 4.91405 16.6875H4.83601C4.16217 16.6875 3.60022 16.6875 3.15414 16.6276C2.6833 16.5643 2.2582 16.425 1.91659 16.0834C1.57499 15.7418 1.43574 15.3167 1.37244 14.8459C1.31246 14.3998 1.31248 13.8379 1.3125 13.164V13.086C1.31248 12.4122 1.31246 11.8502 1.37244 11.4041C1.43574 10.9333 1.57499 10.5082 1.91659 10.1666C2.2582 9.82499 2.6833 9.68574 3.15414 9.62244C3.60023 9.56246 4.16214 9.56248 4.836 9.5625ZM3.30405 10.7374C2.95795 10.7839 2.80983 10.8644 2.71209 10.9621C2.61435 11.0598 2.53394 11.208 2.4874 11.554C2.4387 11.9163 2.4375 12.402 2.4375 13.125C2.4375 13.848 2.4387 14.3337 2.4874 14.696C2.53394 15.0421 2.61435 15.1902 2.71209 15.2879C2.80983 15.3857 2.95795 15.4661 3.30405 15.5126C3.66632 15.5613 4.15199 15.5625 4.875 15.5625C5.59801 15.5625 6.08368 15.5613 6.44596 15.5126C6.79205 15.4661 6.94018 15.3857 7.03791 15.2879C7.13565 15.1902 7.21607 15.0421 7.2626 14.696C7.31131 14.3337 7.3125 13.848 7.3125 13.125C7.3125 12.402 7.31131 11.9163 7.2626 11.554C7.21607 11.208 7.13565 11.0598 7.03791 10.9621C6.94018 10.8644 6.79205 10.7839 6.44596 10.7374C6.08368 10.6887 5.59801 10.6875 4.875 10.6875C4.15199 10.6875 3.66632 10.6887 3.30405 10.7374Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M13.086 1.3125C12.4122 1.31248 11.8502 1.31246 11.4041 1.37244C10.9333 1.43574 10.5082 1.57499 10.1666 1.91659C9.82499 2.2582 9.68574 2.6833 9.62244 3.15414C9.56246 3.60023 9.56248 4.16214 9.5625 4.836V4.914C9.56248 5.58786 9.56246 6.14978 9.62244 6.59586C9.68574 7.06671 9.82499 7.49181 10.1666 7.83341C10.5082 8.17501 10.9333 8.31427 11.4041 8.37757C11.8502 8.43754 12.4121 8.43752 13.086 8.4375H13.164C13.8378 8.43752 14.3998 8.43754 14.8459 8.37757C15.3167 8.31427 15.7418 8.17501 16.0834 7.83341C16.425 7.49181 16.5643 7.06671 16.6276 6.59586C16.6875 6.14978 16.6875 5.58787 16.6875 4.91402V4.83601C16.6875 4.16216 16.6875 3.60022 16.6276 3.15414C16.5643 2.6833 16.425 2.2582 16.0834 1.91659C15.7418 1.57499 15.3167 1.43574 14.8459 1.37244C14.3998 1.31246 13.8379 1.31248 13.164 1.3125H13.086ZM10.9621 2.71209C11.0598 2.61435 11.208 2.53394 11.554 2.4874C11.9163 2.4387 12.402 2.4375 13.125 2.4375C13.848 2.4375 14.3337 2.4387 14.696 2.4874C15.0421 2.53394 15.1902 2.61435 15.2879 2.71209C15.3857 2.80983 15.4661 2.95795 15.5126 3.30405C15.5613 3.66632 15.5625 4.15199 15.5625 4.875C15.5625 5.59801 15.5613 6.08368 15.5126 6.44596C15.4661 6.79205 15.3857 6.94018 15.2879 7.03791C15.1902 7.13565 15.0421 7.21607 14.696 7.2626C14.3337 7.31131 13.848 7.3125 13.125 7.3125C12.402 7.3125 11.9163 7.31131 11.554 7.2626C11.208 7.21607 11.0598 7.13565 10.9621 7.03791C10.8644 6.94018 10.7839 6.79205 10.7374 6.44596C10.6887 6.08368 10.6875 5.59801 10.6875 4.875C10.6875 4.15199 10.6887 3.66632 10.7374 3.30405C10.7839 2.95795 10.8644 2.80983 10.9621 2.71209Z"
                          fill=""
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => setProductStyle("list")}
                      aria-label="button for product list tab"
                      className={`${
                        productStyle === "list"
                          ? "bg-blue border-blue text-white"
                          : "text-dark bg-white border-transparent"
                      } flex items-center justify-center w-9 h-9 rounded border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2.4375 4.5C2.4375 4.08579 2.77329 3.75 3.1875 3.75H14.8125C15.2267 3.75 15.5625 4.08579 15.5625 4.5C15.5625 4.91421 15.2267 5.25 14.8125 5.25H3.1875C2.77329 5.25 2.4375 4.91421 2.4375 4.5Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2.4375 9C2.4375 8.58579 2.77329 8.25 3.1875 8.25H14.8125C15.2267 8.25 15.5625 8.58579 15.5625 9C15.5625 9.41421 15.2267 9.75 14.8125 9.75H3.1875C2.77329 9.75 2.4375 9.41421 2.4375 9Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2.4375 13.5C2.4375 13.0858 2.77329 12.75 3.1875 12.75H14.8125C15.2267 12.75 15.5625 13.0858 15.5625 13.5C15.5625 13.9142 15.2267 14.25 14.8125 14.25H3.1875C2.77329 14.25 2.4375 13.9142 2.4375 13.5Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {searchQuery && (
                  <p className="mt-2 text-sm text-gray-5">
                    Search results for: <span className="font-medium text-dark">"{searchQuery}"</span>
                  </p>
                )}
              </div>

              {/* <!-- Price Filter & Sort --> */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Price Filter */}
                <div className="rounded-lg bg-white shadow-1 px-6 py-4 flex-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span className="text-sm font-medium text-dark whitespace-nowrap">Rango de Precio</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-5">$</span>
                        <input
                          type="number"
                          value={priceRange[0] === 0 ? '' : priceRange[0]}
                          onChange={handleMinPriceChange}
                          placeholder="Mínimo"
                          className="w-full rounded-md border border-gray-3 bg-gray-1 py-2 pl-7 pr-3 text-sm text-dark placeholder:text-gray-5 focus:border-blue focus:outline-none"
                        />
                      </div>
                      <span className="text-gray-5">—</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-5">$</span>
                        <input
                          type="number"
                          value={priceRange[1] === 0 ? '' : priceRange[1]}
                          onChange={handleMaxPriceChange}
                          placeholder="Máximo"
                          className="w-full rounded-md border border-gray-3 bg-gray-1 py-2 pl-7 pr-3 text-sm text-dark placeholder:text-gray-5 focus:border-blue focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={applyPriceFilter}
                        className="rounded-md bg-blue px-4 py-2 text-sm text-white hover:bg-opacity-90 transition-all whitespace-nowrap"
                      >
                        Aplicar
                      </button>
                      {(minPrice || maxPrice) && (
                        <button
                          onClick={clearPriceFilter}
                          className="rounded-md border border-gray-3 px-3 py-2 text-sm text-dark hover:bg-gray-1 transition-all"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="rounded-lg bg-white shadow-1 px-4 py-4 sm:min-w-[280px]">
                  <div className="flex items-center gap-3">
                    <label htmlFor="sort-select" className="text-sm font-medium text-dark whitespace-nowrap">
                      Ordenar por:
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 rounded-md border border-gray-3 bg-gray-1 py-2 px-3 text-sm text-dark focus:border-blue focus:outline-none cursor-pointer min-w-0"
                    >
                      <option value="relevant">Más Relevante</option>
                      <option value="price-asc">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                      <option value="name-asc">Nombre: A a Z</option>
                      <option value="name-desc">Nombre: Z a A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* <!-- Products Grid Tab Content Start --> */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="text-dark">Cargando productos...</div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg">
                  <svg
                    className="mb-4 fill-gray-5"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3 className="text-xl font-semibold text-dark mb-2">No se encontraron productos</h3>
                  <p className="text-gray-5 mb-4">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try different keywords.`
                      : "No products available in this category."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="rounded-md bg-blue px-6 py-2.5 text-white hover:bg-opacity-90 transition-all"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`${
                    productStyle === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                      : "flex flex-col gap-7.5"
                  }`}
                >
                  {currentProducts.map((item, key) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item} key={key} />
                    ) : (
                      <SingleListItem item={item} key={key} />
                    )
                  )}
                </div>
              )}
              {/* <!-- Products Grid Tab Content End --> */}

              {/* <!-- Products Pagination Start --> */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-15">
                  <div className="bg-white shadow-1 rounded-md p-2">
                    <ul className="flex items-center">
                      {/* Previous Button */}
                      <li>
                        <button
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          aria-label="Previous page"
                          type="button"
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </li>

                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page}>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${
                              currentPage === page
                                ? 'bg-blue text-white'
                                : 'hover:text-white hover:bg-blue'
                            }`}
                          >
                            {page}
                          </button>
                        </li>
                      ))}

                      {/* Next Button */}
                      <li>
                        <button
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          aria-label="Next page"
                          type="button"
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:cursor-not-allowed"
                        >
                          <svg
                            className="fill-current"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {/* <!-- Products Pagination End --> */}
            </div>
            {/* // <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
