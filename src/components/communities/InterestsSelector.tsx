
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const AVAILABLE_INTERESTS = [
  'UI/UX', 'Fitness', 'Coding', 'Poetry', 'Photography', 'Music', 'Design',
  'Entrepreneurship', 'Gaming', 'Travel', 'Cooking', 'Art', 'Writing',
  'Technology', 'Sports', 'Reading', 'Dancing', 'Film', 'Fashion', 'Science'
];

interface InterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  minInterests?: number;
  maxInterests?: number;
}

export const InterestsSelector = ({
  selectedInterests,
  onInterestsChange,
  minInterests = 3,
  maxInterests = 7
}: InterestsSelectorProps) => {
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onInterestsChange(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < maxInterests) {
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const isSelected = (interest: string) => selectedInterests.includes(interest);
  const canSelect = selectedInterests.length < maxInterests;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your Interests</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose {minInterests}-{maxInterests} interests to join communities and tag your thoughts
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_INTERESTS.map((interest) => (
            <Badge
              key={interest}
              variant={isSelected(interest) ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                isSelected(interest) 
                  ? 'bg-primary text-primary-foreground' 
                  : canSelect || isSelected(interest)
                    ? 'hover:bg-muted'
                    : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (canSelect || isSelected(interest)) {
                  toggleInterest(interest);
                }
              }}
            >
              {isSelected(interest) && <Check className="w-3 h-3 mr-1" />}
              {interest}
            </Badge>
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Selected: {selectedInterests.length}/{maxInterests} interests
          {selectedInterests.length < minInterests && (
            <span className="text-red-500 ml-2">
              (Minimum {minInterests} required)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
