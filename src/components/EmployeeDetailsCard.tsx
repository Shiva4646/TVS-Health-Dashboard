import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Monitor, Droplets, Phone } from "lucide-react";
import { supabase } from "@/lib/supatest";
import { useToast } from "@/components/ui/use-toast";

interface Employee {
  id: string;
  name: string;
  age: string;
  gender: string;
  deviceId: string;
  bloodGroup: string;
  contactNumber: string;
  mac_address: string;
}

interface EmployeeDetailsCardProps {
  selectedEmployeeInCard: Employee | null;
  setSelectedEmployeeInCard: (employee: Employee | null) => void;
  onDeviceSelect: (mac: string) => void;
}

const EmployeeDetailsCard = ({
  selectedEmployeeInCard,
  setSelectedEmployeeInCard,
  onDeviceSelect
}: EmployeeDetailsCardProps) => {
  const { toast } = useToast();
  const [employeeDetails, setEmployeeDetails] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('Employee%20Details')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (data) {
          const formattedEmployees = data.map(record => ({
            id: record.id.toString(),
            name: `${record['First name'] || ''} ${record['Last name'] || ''}`.trim(),
            age: record['Age']?.toString() || '',
            gender: record['Gender'] || '',
            deviceId: record.mac_address || '',
            bloodGroup: record['Blood group'] || '',
            contactNumber: record['Contact number'] || '',
            mac_address: record.mac_address || ''
          }));

          console.log('Fetched employees:', formattedEmployees);
          setEmployeeDetails(formattedEmployees);
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch employee records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();

    // Set up real-time subscription
    const channel = supabase
      .channel('employee-details-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Employee Details' },
        () => {
          fetchEmployeeDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="flex-shrink-0 bg-white rounded-3xl shadow-lg border-0 transform transition-all duration-300 hover:shadow-xl">
      <CardHeader className="pb-2 px-3 pt-3">
        <CardTitle className="text-gray-900 text-[16px] font-semibold">Employee Details</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-2 animate-fade-in">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Loading employee details...</p>
            </div>
          ) : (
            <>
              <Select
                value={selectedEmployeeInCard?.id || ""}
                onValueChange={(id) => {
                  const selected = employeeDetails.find(emp => emp.id === id);
                  if (selected) {
                    setSelectedEmployeeInCard(selected);
                    if (selected.mac_address) {
                      onDeviceSelect(selected.mac_address);
                    }
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-full h-8 bg-white border-2 border-gray-200 hover:border-blue-300 transition-colors duration-300 rounded-xl text-xs">
                  <SelectValue placeholder={loading ? "Loading..." : "Select an employee"} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-xl z-50 rounded-xl">
                  {employeeDetails.length > 0 ? (
                    employeeDetails.map(employee => (
                      <SelectItem 
                        key={employee.id} 
                        value={employee.id} 
                        className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900 text-sm">{employee.name}</span>
                          </div>
                          {employee.mac_address && (
                            <span className="text-xs text-gray-500">
                              {employee.deviceId}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-gray-500 text-sm">
                      No employees found
                    </div>
                  )}
                </SelectContent>
              </Select>

              {selectedEmployeeInCard ? (
                <div className="space-y-1 mt-2">
                  <div className="flex items-center space-x-1 p-1 bg-gradient-to-r from-gray-50 to-blue-50 rounded-md border border-gray-100">
                    <User className="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-gray-500 mb-0.5 font-medium">Name</p>
                      <p className="text-[12px] font-semibold text-gray-900 truncate">
                        {selectedEmployeeInCard.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center space-x-1 p-1 bg-gradient-to-r from-gray-50 to-green-50 rounded-md border border-gray-100">
                      <User className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] text-gray-500 mb-0.5 font-medium">Age</p>
                        <p className="text-xs font-semibold text-gray-900">
                          {selectedEmployeeInCard.age}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 p-1 bg-gradient-to-r from-gray-50 to-purple-50 rounded-md border border-gray-100">
                      <User className="w-3 h-3 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] text-gray-500 mb-0.5 font-medium">Gender</p>
                        <p className="text-xs font-semibold text-gray-900">
                          {selectedEmployeeInCard.gender}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 p-1 bg-gradient-to-r from-gray-50 to-cyan-50 rounded-md border border-gray-100">
                    <Monitor className="w-3 h-3 text-cyan-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-gray-500 mb-0.5 font-medium">Device ID</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {selectedEmployeeInCard.deviceId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 p-1 bg-gradient-to-r from-gray-50 to-red-50 rounded-md border border-gray-100">
                    <Droplets className="w-3 h-3 text-red-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-gray-500 mb-0.5 font-medium">Blood Group</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {selectedEmployeeInCard.bloodGroup}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 p-1 bg-gradient-to-r from-gray-50 to-orange-50 rounded-md border border-gray-100">
                    <Phone className="w-3 h-3 text-orange-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-gray-500 mb-0.5 font-medium">Contact</p>
                      <p className="text-xs font-semibold text-gray-900">
                        {selectedEmployeeInCard.contactNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">No employee selected</p>
                      <p className="text-xs text-gray-400 mt-1">Select an employee to view details</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeDetailsCard;