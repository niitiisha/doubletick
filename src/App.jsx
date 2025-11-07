import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Logo from '../public/media/Doubletick Logo.png';
import './App.css';

// Generate 1M records
const generateRecords = (count) => {
  const records = [];
  // const names = ['John Smith', 'Emma Wilson', 'Michael Brown', 'Sarah Davis', 'James Johnson', 'Emily Taylor', 'David Martinez', 'Olivia Anderson', 'Robert Thomas', 'Sophia Garcia'];
  const addedByList = ['Kartikey Mishra'];
  
  for (let i = 0; i < count; i++) {
    records.push({
      id: i + 1,
      name: 'Customer Name',
      phone: '+917600060001',
      email: 'john.doe@gmail.com',
      score: i < 0 ? '' : (i === 2 ? '15' : '23'),
      lastMessageAt: 'July 12, 2024, 12:45 PM',
      addedBy: addedByList[i % addedByList.length],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
    });
  }
  return records;
};



const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CustomerTable = () => {
  const [allRecords] = useState(() => generateRecords(1000000));
  const [displayedRecords, setDisplayedRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef();
  const searchTimeoutRef = useRef();
  
  const ROWS_PER_PAGE = 30;

  // Filter and sort records
  const filteredAndSorted = useMemo(() => {
    let filtered = allRecords;
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.name.toLowerCase().includes(search) ||
        record.email.toLowerCase().includes(search) ||
        record.phone.includes(search)
      );
    }
    
    // Sort
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'score') {
          const aNum = parseInt(aVal) || 0;
          const bNum = parseInt(bVal) || 0;
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }, [allRecords, searchTerm, sortConfig]);

  // Load initial records
  useEffect(() => {
    setDisplayedRecords(filteredAndSorted.slice(0, ROWS_PER_PAGE));
    setPage(1);
  }, [filteredAndSorted]);
  
  // Load more records on scroll
  const loadMore = useCallback(() => {
    if (isLoading) return;
    
    const nextPage = page + 1;
    const start = page * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    
    if (start < filteredAndSorted.length) {
      setIsLoading(true);
      setTimeout(() => {
        setDisplayedRecords(prev => [...prev, ...filteredAndSorted.slice(start, end)]);
        setPage(nextPage);
        setIsLoading(false);
      }, 100);
    }

    useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      } },
  }, [page, filteredAndSorted, isLoading]);

  // Intersection observer for infinite scroll
  const lastRowRef = useCallback((node) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, loadMore]);

  // Debounced search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      // Search is already handled by the filteredAndSorted memo
    }, 250);
  };

  // Sort handler
  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="logo-container">
          <img className = 'logo-image' src={Logo} alt="" />
        </div>
      </div>

      {/* Customers header */}
      <div className="customers-header">
        <div className="customers-title-row">
          <h2 className="customers-title">All Customers</h2>
          <span className="customers-count">1230</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-container">
        <div className="search-filters-row">
          <div className="search-wrapper">
            <div className="search-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.09995 13.5002C11.0823 13.5002 13.5 11.0825 13.5 8.1002C13.5 5.11786 11.0823 2.7002 8.09995 2.7002C5.11761 2.7002 2.69995 5.11786 2.69995 8.1002C2.69995 11.0825 5.11761 13.5002 8.09995 13.5002Z" stroke="#2D2D2D" stroke-width="2" stroke-linecap="square"/>
                <path d="M12.0505 12.5312L15.3291 15.9375" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round"/>
            </svg>

            </div>
            <input
              type="text"
              placeholder="Search Customers"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-dropdown-wrapper">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-button"
            >
              <div className="filter-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.25 4.31368C2.25 3.17384 3.17383 2.25 4.31368 2.25H13.6863C14.8262 2.25 15.75 3.17384 15.75 4.31368V5.3623C15.75 6.18325 15.4019 6.96552 14.7919 7.51572L11.006 11.2593C10.7572 11.484 10.6149 11.8036 10.6149 12.1386V13.6674C10.6149 14.1519 10.3201 14.5875 9.86987 14.7663L8.42275 15.3428C7.64635 15.6522 6.80207 15.0801 6.80207 14.2438V11.7649C6.80207 11.4512 6.67727 11.1498 6.45543 10.9279L3.09868 7.93969C2.55575 7.39602 2.25 6.65903 2.25 5.88989V4.31368Z" stroke="#2D2D2D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              Add Filters
            </button>
            
            {showFilters && (
              <div className="filter-dropdown">
                <div className="filter-item">Filter 1</div>
                <div className="filter-item">Filter 2</div>
                <div className="filter-item">Filter 3</div>
                <div className="filter-item">Filter 4</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="customer-table">
          <thead className="table-header">
            <tr>
              <th className="th-checkbox">
                <input type="checkbox" className="checkbox" />
              </th>
              <th 
                className="th-sortable"
                onClick={() => handleSort('name')}
              >
                <div className="th-content">
                  Customer
                  <SortIcon column="name" />
                </div>
              </th>
              <th 
                className="th-sortable"
                onClick={() => handleSort('score')}
              >
                <div className="th-content">
                  Score
                  <SortIcon column="score" />
                </div>
              </th>
              <th 
                className="th-sortable"
                onClick={() => handleSort('email')}
              >
                <div className="th-content">
                  Email
                  <SortIcon column="email" />
                </div>
              </th>
              <th 
                className="th-sortable"
                onClick={() => handleSort('lastMessageAt')}
              >
                <div className="th-content">
                  Last message sent at
                  <SortIcon column="lastMessageAt" />
                </div>
              </th>
              <th 
                className="th-sortable"
                onClick={() => handleSort('addedBy')}
              >
                <div className="th-content">
                  Added by
                  <SortIcon column="addedBy" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="table-body">
            {displayedRecords.map((record, index) => (
              <tr 
                key={`${record.id}-${index}`}
                ref={index === displayedRecords.length - 1 ? lastRowRef : null}
                className="table-row"
              >
                <td className="td-checkbox">
                  <input type="checkbox" className="checkbox" />
                </td>
                <td className="td-customer">
                  <div className="customer-info">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.69397 13.3332C3.69397 11.9275 4.80306 10.1772 7.99983 10.1772C11.196 10.1772 12.305 11.9148 12.305 13.3212" stroke="#7A7A7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.7502 5.41744C10.7502 6.93653 9.51891 8.16786 7.99978 8.16786C6.48131 8.16786 5.24997 6.93653 5.24997 5.41744C5.24997 3.89833 6.48131 2.66699 7.99978 2.66699C9.51891 2.66699 10.7502 3.89833 10.7502 5.41744Z" stroke="#7A7A7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>

                    <div className="customer-details">
                      <div className="customer-name">{record.name}</div>
                      <div className="customer-phone">{record.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="td-score">{record.score}</td>
                <td className="td-email">{record.email}</td>
                <td className="td-date">{record.lastMessageAt}</td>
                <td className="td-added-by">
                  <div className="added-by-info">
                    <UserIcon />
                    {record.addedBy}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CustomerTable;
