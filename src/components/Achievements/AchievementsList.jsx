import React, { useState, useEffect } from 'react';
import { Trophy, Lock, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import achievementManager from '../../services/AchievementManager';
import { Progress } from '../ui/progress';

const AchievementsList = () => {
  const [earnedAchievements, setEarnedAchievements] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  
  useEffect(() => {
    // Load achievements data
    const earned = achievementManager.getEarnedAchievements();
    const points = achievementManager.getTotalPoints();
    
    setEarnedAchievements(earned);
    setTotalPoints(points);
  }, []);
  
  // Get all achievements
  const allAchievements = Object.values(achievementManager.getAchievements());
  
  // Calculate level based on points
  const calculateLevel = (points) => {
    return Math.floor(points / 100) + 1;
  };
  
  // Calculate progress to next level
  const calculateLevelProgress = (points) => {
    const level = calculateLevel(points);
    const pointsForCurrentLevel = (level - 1) * 100;
    const progressToNextLevel = points - pointsForCurrentLevel;
    return (progressToNextLevel / 100) * 100;
  };
  
  // Filter achievements
  const filteredAchievements = showAllAchievements 
    ? allAchievements 
    : allAchievements.filter(achievement => earnedAchievements[achievement.id]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievements
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAllAchievements(!showAllAchievements)}
        >
          {showAllAchievements ? 'Show Earned Only' : 'Show All Achievements'}
        </Button>
      </div>
      
      {/* Level and Points */}
      <div className="bg-muted/30 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg">Level {calculateLevel(totalPoints)}</h3>
            <p className="text-sm text-muted-foreground">{totalPoints} total points</p>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Earn points by completing achievements</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <Progress value={calculateLevelProgress(totalPoints)} className="h-2" />
        <p className="text-xs text-right mt-1 text-muted-foreground">
          {100 - (calculateLevelProgress(totalPoints) % 100)} points to Level {calculateLevel(totalPoints) + 1}
        </p>
      </div>
      
      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredAchievements.map(achievement => {
          const isEarned = !!earnedAchievements[achievement.id];
          const earnedDate = isEarned ? new Date(earnedAchievements[achievement.id]) : null;
          
          return (
            <div 
              key={achievement.id}
              className={`border rounded-lg p-3 transition-all ${
                isEarned ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${isEarned ? '' : 'opacity-50'}`}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{achievement.title}</h3>
                    {!isEarned && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-semibold text-primary">
                      +{achievement.points} points
                    </span>
                    
                    {isEarned && (
                      <span className="text-xs text-muted-foreground">
                        Earned {earnedDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">
            {showAllAchievements 
              ? "No achievements available" 
              : "You haven't earned any achievements yet. Keep saving!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementsList; 