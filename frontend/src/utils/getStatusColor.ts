// Assigns every status to a color

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Completed':
      return 'bg-[#10A170] text-white';
    case 'Purchased':
      return 'bg-[#89C2E8] text-white';
    case 'Requested':
      return 'bg-[#E61744] text-white';
    case 'Returned':
    case 'Cancelled':
      return 'bg-[#666666] text-white';
    default:
      return 'bg-[#666666] text-white';
  }
};
