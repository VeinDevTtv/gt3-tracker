import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Trophy, Target, Calendar, Zap, Tool, Clock, Sparkles } from 'lucide-react';
import AchievementsList from '@/components/AchievementsList';
import achievementManager from '../services/AchievementManager';

const Achievements = ({ theme }) => {
  const [showUnearned, setShowUnearned] = useState(true);
  
  // Get achievement data
  const allAchievements = Object.values(achievementManager.getAchievements());
  const earnedAchievements = achievementManager.getEarnedAchievements();
  const totalPoints = achievementManager.getTotalPoints();
  const maxPoints = allAchievements.reduce((total, ach) => total + ach.points, 0);
  
  // Get counts by category
  const categories = {
    'Getting Started': { icon: <Target />, count: 0, earned: 0, total: 0 },
    'Milestone': { icon: <Trophy />, count: 0, earned: 0, total: 0 },
    'Consistency': { icon: <Calendar />, count: 0, earned: 0, total: 0 },
    'Amount Based': { icon: <Zap />, count: 0, earned: 0, total: 0 },
    'Tools & Features': { icon: <Tool />, count: 0, earned: 0, total: 0 },
    'Time Based': { icon: <Clock />, count: 0, earned: 0, total: 0 },
    'Special Achievements': { icon: <Sparkles />, count: 0, earned: 0, total: 0 }
  };
  
  // Calculate stats by category
  allAchievements.forEach(achievement => {
    if (categories[achievement.category]) {
      categories[achievement.category].count++;
      categories[achievement.category].total += achievement.points;
      
      if (earnedAchievements[achievement.id]) {
        categories[achievement.category].earned++;
      }
    }
  });
  
  // Calculate total stats
  const totalAchievements = allAchievements.length;
  const earnedCount = Object.keys(earnedAchievements).length;
  const completionPercentage = Math.round((earnedCount / totalAchievements) * 100) || 0;
  const pointsPercentage = Math.round((totalPoints / maxPoints) * 100) || 0;
  
  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          Achievements
        </h1>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1 font-semibold">
            {totalPoints} / {maxPoints} pts
          </Badge>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {earnedCount} of {totalAchievements} achievements unlocked
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{pointsPercentage}%</span>
              </div>
              <Progress value={pointsPercentage} className="h-2" />
              <div className="text-sm text-muted-foreground mt-2">
                {totalPoints} of {maxPoints} points earned
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rarity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-muted-foreground">Common</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-muted-foreground">Uncommon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-muted-foreground">Rare</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-muted-foreground">Legendary</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(categories).map(([category, data]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <span className="text-primary">{data.icon}</span>
                {category}
              </CardTitle>
              <CardDescription>
                {data.earned} / {data.count} achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <Progress 
                value={(data.earned / data.count) * 100 || 0} 
                className="h-2 mb-2" 
              />
              <div className="text-sm text-muted-foreground">
                {data.earned === data.count ? (
                  <span className="text-green-500 font-medium">Complete!</span>
                ) : (
                  `${data.total} total points`
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Achievements list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Achievements</CardTitle>
            <label className="flex items-center text-sm">
              <input 
                type="checkbox" 
                checked={showUnearned}
                onChange={(e) => setShowUnearned(e.target.checked)}
                className="mr-2"
              />
              Show unearned
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              {Object.keys(categories).map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <AchievementsList showUnearned={showUnearned} />
            </TabsContent>
            
            {Object.keys(categories).map(category => (
              <TabsContent key={category} value={category}>
                <AchievementsList 
                  filter={category} 
                  showUnearned={showUnearned} 
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Achievements; 