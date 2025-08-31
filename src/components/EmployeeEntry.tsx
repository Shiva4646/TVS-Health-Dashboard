import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '../lib/supatest';

interface EmployeeEntryProps {
  onBack: () => void;
  onAddEmployee: (employee: { 
    name: string;
    age: string;
    gender: string;
    deviceId: string;  // Changed from location
    bloodGroup: string;
    contactNumber: string;
  }) => Promise<void>;
}

const EmployeeEntry = ({ onBack, onAddEmployee }: EmployeeEntryProps) => {
  const { toast } = useToast();
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'Male',
    deviceId: '',  // Changed from location
    bloodGroup: '',
    contactNumber: ''
  });

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Modify the insert query
      const { error } = await supabase
        .from('Health Status')  // Remove quotes from table name
        .insert({
          "First name": formData.firstName,
          "Last name": formData.lastName,
          "Age": parseInt(formData.age),
          "Gender": formData.gender,
          "Device ID": formData.deviceId,
          "Blood Group": formData.bloodGroup,
          "Contact Number": formData.contactNumber,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Employee added successfully",
        variant: "default",
      });

      // Call onAddEmployee after successful insert
      await onAddEmployee({
        name: `${formData.firstName} ${formData.lastName}`,
        age: formData.age,
        gender: formData.gender,
        deviceId: formData.deviceId,
        bloodGroup: formData.bloodGroup,
        contactNumber: formData.contactNumber
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        age: '',
        gender: 'Male',
        deviceId: '',
        bloodGroup: '',
        contactNumber: ''
      });

      onBack();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please check the console for details.",
        variant: "destructive",
      });
    }
  };

  // Fetch employees effect
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('Health Status')  // Remove quotes from table name
          .select(`
            id,
            "First name",
            "Last name",
            "Age",
            "Gender",
            "Device ID",
            "Blood Group",
            "Contact Number"
          `)
          .not('First name', 'is', null);

        if (error) throw error;

        if (data) {
          const employees = data.map(record => ({
            id: record.id,
            name: `${record['First name']} ${record['Last name']}`,
            age: record['Age']?.toString() || '',
            gender: record['Gender'] || '',
            deviceId: record['Device ID'] || '',
            bloodGroup: record['Blood Group'] || '',
            contactNumber: record['Contact Number'] || ''
          }));

          setAllEmployees(employees);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();

    // Update subscription
    const channel = supabase
      .channel('employee-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Health Status' },
        fetchEmployees
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-white w-full max-w-2xl mx-auto p-2">
      <div className="text-center justify-center mb-6 flex items-center">
        <div>
          <h2 className="text-2xl font-bold">Add New Employee</h2>
          <p>Enter the employee details below to create a new monitoring profile.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="firstName" className="font-medium">First Name</Label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="First Name"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="font-medium">Last Name</Label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Last Name"
              required
            />
          </div>
        </div>

        {/* Age and Gender */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="age" className="font-medium">Age</Label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="27"
              required
            />
          </div>
          <div>
            <Label htmlFor="gender" className="font-medium">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-black"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Device ID */}
        <div>
          <Label htmlFor="deviceId" className="font-medium">Device ID</Label>
          <select
            id="deviceId"
            value={formData.deviceId}
            onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
            className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-black"
            required
          >
            <option value="">Select Device ID</option>
            <option value="Device 1">Device 1</option>
            <option value="Device 2">Device 2</option>
            
          </select>
        </div>

        {/* Blood Group and Contact Number */}
        <div className="grid grid-cols-2 gap-">
          <div>
            <Label htmlFor="bloodGroup" className="font-medium">Blood Group</Label>
            <select
              id="bloodGroup"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-black"
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div>
            <Label htmlFor="contactNumber" className="font-medium">Contact Number</Label>
            <input
              type="tel"
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              pattern="[0-9]{10}"
              placeholder="Phone number"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-6">
          <Button
            type="button"
            variant="outline"
            className="bg-white text-black border-gray-300 hover:bg-gray-50"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Add Employee
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeEntry;
