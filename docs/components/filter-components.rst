=================
Filter Components
=================

Overview
========

Filter components provide a consistent way to implement filtering controls in Lydia applications. These components are designed to be reusable and composable, making it easy to build complex filtering interfaces.

Available Components
==================

FilterSection
-----------

A container component that provides consistent styling and layout for filter sections.

.. code-block:: typescript

   import { FilterSection } from "@/Components/Filters";

   function MyFilters() {
     return (
       <FilterSection title="Status">
         {/* Filter controls go here */}
       </FilterSection>
     );
   }

Props:

+------------+----------+----------+----------------------------------+
| Name       | Type     | Required | Description                      |
+============+==========+==========+==================================+
| title      | string   | Yes      | Title of the filter section      |
+------------+----------+----------+----------------------------------+
| children   | ReactNode| Yes      | Filter controls                  |
+------------+----------+----------+----------------------------------+
| className  | string   | No       | Additional CSS classes           |
+------------+----------+----------+----------------------------------+

RadioFilterGroup
--------------

A group of radio buttons for single-selection filtering.

.. code-block:: typescript

   import { RadioFilterGroup } from "@/Components/Filters";

   function StatusFilter() {
     const options = [
       { id: "status-all", label: "All Statuses" },
       { id: "status-active", label: "Active" },
       { id: "status-inactive", label: "Inactive" }
     ];

     return (
       <RadioFilterGroup
         options={options}
         selectedId="status-all"
         onChange={handleStatusChange}
         name="status-filter"
       />
     );
   }

Props:

+---------------+------------------+----------+----------------------------------+
| Name          | Type             | Required | Description                      |
+===============+==================+==========+==================================+
| options       | FilterOption[]   | Yes      | Array of filter options          |
+---------------+------------------+----------+----------------------------------+
| selectedId    | string           | Yes      | ID of the selected option        |
+---------------+------------------+----------+----------------------------------+
| onChange      | (id: string)=>void| Yes     | Callback when selection changes  |
+---------------+------------------+----------+----------------------------------+
| name          | string           | Yes      | Name for the radio input group   |
+---------------+------------------+----------+----------------------------------+
| className     | string           | No       | Additional CSS classes           |
+---------------+------------------+----------+----------------------------------+

FilterOption Type:

.. code-block:: typescript

   interface FilterOption {
     id: string;    // Unique identifier for the option
     label: string; // Display label for the option
   }

Usage Examples
=============

Basic Example
-----------

.. code-block:: typescript

   import { FilterSection, RadioFilterGroup } from "@/Components/Filters";
   import { useState } from "react";

   function FilterPanel() {
     const [statusFilter, setStatusFilter] = useState("status-all");
     
     const statusOptions = [
       { id: "status-all", label: "All Statuses" },
       { id: "status-active", label: "Active" },
       { id: "status-inactive", label: "Inactive" }
     ];
     
     return (
       <div className="filter-panel">
         <FilterSection title="Status">
           <RadioFilterGroup
             options={statusOptions}
             selectedId={statusFilter}
             onChange={setStatusFilter}
             name="status-filter"
           />
         </FilterSection>
       </div>
     );
   }

Multiple Filter Sections
----------------------

.. code-block:: typescript

   import { FilterSection, RadioFilterGroup } from "@/Components/Filters";
   import { useState } from "react";

   function ComplexFilterPanel() {
     const [statusFilter, setStatusFilter] = useState("status-all");
     const [typeFilter, setTypeFilter] = useState("type-all");
     
     const statusOptions = [
       { id: "status-all", label: "All Statuses" },
       { id: "status-active", label: "Active" },
       { id: "status-inactive", label: "Inactive" }
     ];
     
     const typeOptions = [
       { id: "type-all", label: "All Types" },
       { id: "type-user", label: "User" },
       { id: "type-admin", label: "Admin" },
       { id: "type-guest", label: "Guest" }
     ];
     
     return (
       <div className="filter-panel">
         <FilterSection title="Status">
           <RadioFilterGroup
             options={statusOptions}
             selectedId={statusFilter}
             onChange={setStatusFilter}
             name="status-filter"
           />
         </FilterSection>
         
         <FilterSection title="User Type">
           <RadioFilterGroup
             options={typeOptions}
             selectedId={typeFilter}
             onChange={setTypeFilter}
             name="type-filter"
           />
         </FilterSection>
       </div>
     );
   }

Integration with Other Components
-------------------------------

Filter components can be easily integrated with other components like DateRangeSelector, SearchInput, etc.

.. code-block:: typescript

   import { FilterSection, RadioFilterGroup } from "@/Components/Filters";
   import { DateRangeSelector } from "@/Components/Inputs";
   import { SearchInput } from "@/Components/Inputs/SearchInput";
   import { useState } from "react";
   
   function CompleteFilterPanel() {
     const [statusFilter, setStatusFilter] = useState("status-all");
     const [searchQuery, setSearchQuery] = useState("");
     const [dateRange, setDateRange] = useState({
       startDate: null,
       endDate: null
     });
     
     const statusOptions = [
       { id: "status-all", label: "All Statuses" },
       { id: "status-active", label: "Active" },
       { id: "status-inactive", label: "Inactive" }
     ];
     
     return (
       <div className="filter-panel">
         <SearchInput
           value={searchQuery}
           onChange={setSearchQuery}
           placeholder="Search..."
           className="mb-4"
         />
         
         <FilterSection title="Date Range">
           <DateRangeSelector
             onChange={setDateRange}
             startDate={dateRange.startDate}
             endDate={dateRange.endDate}
           />
         </FilterSection>
         
         <FilterSection title="Status">
           <RadioFilterGroup
             options={statusOptions}
             selectedId={statusFilter}
             onChange={setStatusFilter}
             name="status-filter"
           />
         </FilterSection>
       </div>
     );
   }

Source Code
==========

* ``src/Components/Filters/FilterSection.tsx``: Filter section container
* ``src/Components/Filters/RadioFilterGroup.tsx``: Radio button filter group
* ``src/Components/Filters/index.ts``: Public API exports