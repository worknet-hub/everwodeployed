import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingLayout } from './OnboardingLayout';
import { User, School, MapPin } from 'lucide-react';

interface ProfileSetupStepProps {
  data: {
    college_name: string;
    bio: string;
    location: string;
    year_of_study: string;
    major: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const ProfileSetupStep = ({ data, onUpdate, onNext, onPrevious }: ProfileSetupStepProps) => {
  const [formData, setFormData] = useState(data);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const isFormValid = formData.college_name && formData.major && formData.year_of_study;

  return (
    <OnboardingLayout
      currentStep={5}
      totalSteps={6}
      title="Tell us about yourself"
      subtitle="Help other students find and connect with you"
    >
      <div className="space-y-6">
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="college_name" className="flex items-center space-x-2">
              <School className="w-4 h-4" />
              <span>College/University *</span>
            </Label>
            <Input
              id="college_name"
              value={formData.college_name}
              onChange={(e) => handleInputChange('college_name', e.target.value)}
              placeholder="e.g., Harvard University"
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study *</Label>
              <Input
                id="major"
                value={formData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                placeholder="e.g., Computer Science"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_of_study">Year of Study *</Label>
              <Select value={formData.year_of_study} onValueChange={(value) => handleInputChange('year_of_study', value)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent>
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
            <Label htmlFor="location" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Boston, MA"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Bio</span>
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself, your interests, and what you're studying..."
              className="min-h-[100px] resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious} className="h-12 px-8">
            Previous
          </Button>
          <Button onClick={onNext} disabled={!isFormValid} className="h-12 px-8">
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
