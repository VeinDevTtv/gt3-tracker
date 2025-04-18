import React from 'react';
import { useGoals } from '../contexts/GoalsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trophy, Target, Calendar, Award, Medal, Clock, Flame } from 'lucide-react';
import { format } from 'date-fns';

const AchievementsList = ({ theme }) => {
  const { activeGoal } = useGoals();
  
  if (!activeGoal || !activeGoal.achievements || activeGoal.achievements.length === 0) {
    return (
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary-color" />
            Achievements
          </CardTitle>
          <CardDescription>
            Complete milestones to earn achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="h-16 w-16 text-gray-400 mb-3" />
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
              No achievements yet. Keep saving to earn badges!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Sort achievements by date (newest first)
  const sortedAchievements = [...activeGoal.achievements].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Get the icon based on achievement type
  const getAchievementIcon = (achievement) => {
    switch (achievement.type) {
      case 'milestone':
        return <Target className="h-10 w-10 text-primary-color" />;
      case 'streak':
        return <Flame className="h-10 w-10 text-orange-500" />;
      case 'consistency':
        return <Calendar className="h-10 w-10 text-purple-500" />;
      case 'speed':
        return <Clock className="h-10 w-10 text-blue-500" />;
      default:
        return <Medal className="h-10 w-10 text-yellow-500" />;
    }
  };
  
  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary-color" />
          Achievements
        </CardTitle>
        <CardDescription>
          {sortedAchievements.length} achievements earned
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAchievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`flex items-center gap-4 p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}
            >
              <div className={`flex items-center justify-center h-14 w-14 rounded-full ${
                achievement.type === 'milestone' ? 'bg-primary-color/20' :
                achievement.type === 'streak' ? 'bg-orange-500/20' : 
                achievement.type === 'consistency' ? 'bg-purple-500/20' :
                achievement.type === 'speed' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
              }`}>
                {getAchievementIcon(achievement)}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>
                  {achievement.title}
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {achievement.description}
                </p>
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {format(new Date(achievement.date), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsList; 