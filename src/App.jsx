import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Logo from '../public/media/Doubletick Logo.png';
import './App.css';

const generateRecords = (count) => {
  const records = [];
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
  const filterRef = useRef(null); // Ref for filter dropdown

  const ROWS_PER_PAGE = 30;

  // Filter and sort records
  const filteredAndSorted = useMemo(() => {
    let filtered = allRecords;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.name.toLowerCase().includes(search) ||
        record.email.toLowerCase().includes(search) ||
        record.phone.includes(search)
      );
    }
    
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
    
    searchTimeoutRef.current = setTimeout(() => {}, 250);
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

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="logo-container">
          <img className='logo-image' src={Logo} alt="" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters-container">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search Customers"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-dropdown-wrapper" ref={filterRef}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="filter-button"
          >
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

      {/* Table */}
      <div className="table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Score</th>
              <th>Email</th>
              <th>Last message sent at</th>
              <th>Added by</th>
            </tr>
          </thead>
          <tbody>
            {displayedRecords.map((record, index) => (
              <tr key={record.id} ref={index === displayedRecords.length - 1 ? lastRowRef : null}>
                <td>{record.name}</td>
                <td>{record.score}</td>
                <td>{record.email}</td>
                <td>{record.lastMessageAt}</td>
                <td>{record.addedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;
