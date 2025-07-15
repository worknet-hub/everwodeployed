import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, School, MapPin, Sun, Moon, CheckCircle, X } from 'lucide-react';
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { Combobox } from '@/components/ui/combobox';

interface PersonalizeScreenProps {
  data: {
    college_name: string;
    bio: string;
    location: string;
    year_of_study: string;
    major: string;
    theme: 'dark' | 'light';
  };
  onUpdate: (data: any) => void;
  onComplete: () => void;
  onPrevious: () => void;
  isCompleting: boolean;
}

export const PersonalizeScreen = ({ data, onUpdate, onComplete, onPrevious, isCompleting }: PersonalizeScreenProps) => {
  const [formData, setFormData] = useState(data);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleThemeToggle = (isDark: boolean) => {
    const theme: 'dark' | 'light' = isDark ? 'dark' : 'light';
    const newData = { ...formData, theme };
    setFormData(newData);
    onUpdate(newData);
  };

  const isFormValid = formData.college_name && formData.major && formData.year_of_study;

  const MAJORS = [
    'Accounting', 'Actuarial Science', 'Advertising', 'Agriculture', 'Animal Science', 'Anthropology',
    'Applied Mathematics', 'Architecture', 'Artificial Intelligence', 'Astronomy', 'Astrophysics', 'Aviation',
    'Banking & Finance', 'Biochemistry', 'Bioengineering', 'Bioinformatics', 'Biology', 'Biomedical Engineering',
    'Biotechnology', 'Botany', 'Business Administration', 'Chemical Engineering', 'Chemistry', 'Civil Engineering',
    'Cognitive Science', 'Commerce', 'Communication', 'Comparative Literature', 'Computer Engineering',
    'Computer Science', 'Construction Management', 'Criminal Justice', 'Culinary Arts', 'Cybersecurity',
    'Data Analytics', 'Data Science', 'Dentistry', 'Design (Graphic, Product, Industrial)', 'Development Studies',
    'Dietetics / Nutrition', 'Digital Marketing', 'Economics', 'Education', 'Electrical Engineering',
    'Electronics and Communication Engineering', 'Energy Engineering', 'English Literature', 'Entrepreneurship',
    'Environmental Engineering', 'Environmental Science', 'Fashion Design', 'Film & Media Studies', 'Finance',
    'Fine Arts', 'Food Technology', 'Forensic Science', 'Game Design', 'Genetics', 'Geography',
    'Geology / Earth Sciences', 'History', 'Hospitality Management', 'Human Resource Management',
    'Industrial Design', 'Industrial Engineering', 'Information Systems', 'Information Technology',
    'Innovation Management', 'Interior Design', 'International Business', 'International Relations',
    'Islamic Studies', 'Journalism', 'Landscape Architecture', 'Languages (e.g., Spanish, French, Chinese)',
    'Law', 'Library Science', 'Linguistics', 'Logistics & Supply Chain', 'Machine Learning', 'Marine Biology',
    'Marketing', 'Mass Communication', 'Materials Science', 'Mathematics', 'Mechanical Engineering',
    'Mechatronics', 'Media Studies', 'Medical Laboratory Science', 'Medicine (MBBS)', 'Microbiology',
    'Mining Engineering', 'Music', 'Nanotechnology', 'Neurology', 'Nursing', 'Nutrition Science',
    'Oceanography', 'Optometry', 'Petroleum Engineering', 'Pharmacy', 'Philosophy', 'Photography',
    'Physical Education', 'Physics', 'Physiotherapy', 'Planetary Science', 'Political Science', 'Pre-Law',
    'Pre-Med', 'Product Design', 'Psychology', 'Public Administration', 'Public Health', 'Public Policy',
    'Radiology', 'Real Estate', 'Religious Studies', 'Renewable Energy', 'Robotics', 'Rural Development',
    'Social Work', 'Sociology', 'Software Engineering', 'Sports Management', 'Statistics',
    'Supply Chain Management', 'Sustainability Studies', 'Teaching / B.Ed', 'Textile Engineering',
    'Theatre / Performing Arts', 'Theology', 'Tourism & Travel', 'Urban Planning', 'Veterinary Science',
    'Visual Arts', 'Web Development', 'Zoology'
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-white/20 to-gray-200/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Personalize</h2>
            <p className="text-gray-400">Make Everwo truly yours</p>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData.theme === 'dark' ? (
                <Moon className="w-5 h-5 text-white" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-gray-400 text-sm">Choose your preferred theme</p>
              </div>
            </div>
            <Switch
              checked={formData.theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="college_name" className="flex items-center space-x-2 text-gray-300">
              <School className="w-4 h-4" />
              <span>College/University *</span>
            </Label>
            <Input
              id="college_name"
              value={formData.college_name}
              onChange={(e) => handleInputChange('college_name', e.target.value)}
              placeholder="e.g., Harvard University"
              className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="major" className="text-gray-300">Major *</Label>
              <div className="relative">
                {/* Improved Combobox for major selection */}
                <MajorCombobox value={formData.major} onChange={major => handleInputChange('major', major)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_of_study" className="text-gray-300">Year *</Label>
              <Select value={formData.year_of_study} onValueChange={(value) => handleInputChange('year_of_study', value)}>
                <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="first">First Year</SelectItem>
                  <SelectItem value="second">Second Year</SelectItem>
                  <SelectItem value="third">Third Year</SelectItem>
                  <SelectItem value="fourth">Fourth Year</SelectItem>
                  <SelectItem value="fifth">Fifth Year</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2 text-gray-300">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Boston, MA"
              className="h-12 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-gray-300">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[80px] bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 pt-4">
          <Button 
            onClick={onPrevious}
            variant="outline"
            className="flex-1 h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            disabled={isCompleting}
          >
            Back
          </Button>
          <Button 
            onClick={onComplete}
            disabled={!isFormValid || isCompleting}
            className="flex-1 h-12 bg-gradient-to-r from-white to-gray-200 text-black rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {isCompleting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Setting up...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Complete Setup</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

function MajorCombobox({ value, onChange }: { value: string, onChange: (major: string) => void }) {
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = MAJORS.filter(major => major.toLowerCase().includes(search.toLowerCase()));

  // Show dropdown when focused or typing
  const showDropdown = isFocused && search.length > 0 && filtered.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (value) onChange('');
  };

  const handleSelect = (major: string) => {
    onChange(major);
    setSearch('');
    setIsFocused(false);
    if (inputRef.current) inputRef.current.blur();
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
    setIsFocused(true);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div>
      {value ? (
        <span className="inline-flex items-center bg-white/10 text-white rounded-full px-3 py-1 text-sm cursor-not-allowed select-none">
          {value}
        </span>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 100)}
            placeholder="Search and select your major..."
            className="h-12 w-full bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl px-3"
            autoComplete="off"
          />
          {showDropdown && (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
              {filtered.map(major => (
                <div
                  key={major}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-black"
                  onMouseDown={() => handleSelect(major)}
                >
                  {major}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
