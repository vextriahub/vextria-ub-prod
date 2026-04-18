export const getStatusColor = (status: string) => {
  switch (status) {
    case "quente": return "bg-red-100 text-red-800";
    case "morno": return "bg-yellow-100 text-yellow-800";
    case "frio": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
};
