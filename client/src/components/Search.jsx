import React, { useEffect, useState } from 'react';
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
const Search = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchPage, setIsSearchPage] = useState(false);
    const [isMobile] = useMobile();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const params = useLocation();
    const searchText = params.search.slice(3);
    useEffect(() => {
        const isSearch = location.pathname === "/search";
        setIsSearchPage(isSearch);
    }, [location]);
    useEffect(() => {
        // Fetch categories from API
        const fetchCategories = async () => {
            try {
                const response = await Axios({ ...SummaryApi.getCategory });
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);
    const redirectToSearchPage = () => {
        navigate("/search");
    };
    const handleOnChange = (e) => {
        const value = e.target.value;
        const url = `/search?q=${value}`;
        navigate(url);
    };
    return (
        <div className='w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-lg border overflow-hidden flex items-center text-neutral-500 bg-slate-50 group focus-within:border-primary-200'>
            {/* Category Dropdown */}
            <div className="relative">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className='h-full bg-transparent px-3 outline-none text-sm font-medium text-gray-700 cursor-pointer'
                >
                    <option>All Categories</option>
                    {categories.map(category => (
                        <option key={category._id} value={category.name}>{category.name}</option>
                    ))}
                </select>
            </div>
            {/* Search Icon */}
            <div>
                {isMobile && isSearchPage ? (
                    <Link to="/" className='flex justify-center items-center h-full p-2 m-1 group-focus-within:text-primary-200 bg-white rounded-full shadow-md'>
                        <FaArrowLeft size={20} />
                    </Link>
                ) : (
                    <button className='flex justify-center items-center h-full p-3 group-focus-within:text-primary-200'>
                        <IoSearch size={22} className="text-white bg-green-500 rounded-full p-1" />
                    </button>
                )}
            </div>
            {/* Search Input */}
            <div className='w-full h-full'>
                {!isSearchPage ? (
                    <div onClick={redirectToSearchPage} className='w-full h-full flex items-center'>
                        <TypeAnimation
                            sequence={[
                                'Search "Watch"',
                                1000,
                                'Search "Mobile"',
                                1000,
                                'Search "Trimmer"',
                                1000,
                                'Search "Cables"',
                                1000,
                                'Search "Chargers"',
                                1000,
                                'Search "Mouse"',
                                1000,
                                'Search "Keyboard"',
                                1000,
                                'Search "Earpods"',
                                1000,
                                'Search "Neckband"',
                            ]}
                            wrapper="span"
                            speed={50}
                            repeat={Infinity}
                        />
                    </div>
                ) : (
                    <div className='w-full h-full'>
                        <input
                            type='text'
                            placeholder='Search for You.'
                            autoFocus
                            defaultValue={searchText}
                            className='bg-transparent w-full h-full outline-none'
                            onChange={handleOnChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
export default Search;