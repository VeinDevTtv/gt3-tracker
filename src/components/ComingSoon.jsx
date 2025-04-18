import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CalendarClock } from 'lucide-react';

const ComingSoon = ({ title = "Coming Soon", description = "This feature is under development and will be available soon.", theme }) => {
  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary-color" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-24 h-24 flex items-center justify-center rounded-full bg-primary-color/10 mb-4">
            <CalendarClock className="h-12 w-12 text-primary-color" />
          </div>
          <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            We're working hard to bring you this feature.
            <br />
            Check back soon!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComingSoon; 