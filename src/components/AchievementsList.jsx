import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import achievementManager from '../../services/AchievementManager';

/**
 * Component to display a list of achievements
 * 
 * @param {Object} props
 * @param {Array} props.filter - Optional category filter
 * @param {Boolean} props.showUnearned - Whether to show unearned achievements
 * @param {Boolean} props.compact - Whether to show a compact version
 * @param {Number} props.limit - Optional limit on number of achievements shown
 */
const AchievementsList = ({ 
  filter, 
  showUnearned = false, 
  compact = false,
  limit = 0
}) => {
  // Get all achievements and earned ones
  const allAchievements = Object.values(achievementManager.getAchievements());
  const earnedAchievements = achievementManager.getEarnedAchievements();
  
  // Filter achievements based on props
  let achievementsToShow = allAchievements;
  
  // Apply category filter if provided
  if (filter) {
    achievementsToShow = achievementsToShow.filter(achievement => {
      // If filter is array, check if achievement category is in the array
      if (Array.isArray(filter)) {
        return filter.includes(achievement.category);
      }
      // Otherwise treat filter as a single category
      return achievement.category === filter;
    });
  }
  
  // Filter based on earned status
  if (!showUnearned) {
    achievementsToShow = achievementsToShow.filter(achievement => 
      earnedAchievements[achievement.id]
    );
  }
  
  // Apply limit if provided
  if (limit > 0) {
    achievementsToShow = achievementsToShow.slice(0, limit);
  }
  
  // Sort achievements: earned first, then by category and points
  achievementsToShow.sort((a, b) => {
    // First sort by earned status
    const aEarned = !!earnedAchievements[a.id];
    const bEarned = !!earnedAchievements[b.id];
    
    if (aEarned && !bEarned) return -1;
    if (!aEarned && bEarned) return 1;
    
    // Then sort by category
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    
    // Then sort by points (highest first)
    return b.points - a.points;
  });
  
  // If there are no achievements to show
  if (achievementsToShow.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {filter ? "No achievements in this category yet." : "No achievements earned yet."}
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full max-h-[500px]">
      <div className="space-y-3">
        {achievementsToShow.map(achievement => {
          const isEarned = !!earnedAchievements[achievement.id];
          const earnedDate = earnedAchievements[achievement.id] 
            ? new Date(earnedAchievements[achievement.id])
            : null;
            
          return (
            <div 
              key={achievement.id}
              className={`flex items-start p-3 rounded-lg border ${
                isEarned 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'bg-muted/50 border-border opacity-60'
              }`}
            >
              <div className="flex-shrink-0 text-3xl mr-3">
                {achievement.icon}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{achievement.title}</h4>
                  
                  <div className="flex items-center gap-2">
                    {/* Points badge */}
                    <Badge variant="outline" className="ml-2">
                      {achievement.points} pts
                    </Badge>
                    
                    {/* Unlock date for earned achievements */}
                    {isEarned && !compact && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs text-muted-foreground">
                            {earnedDate.toLocaleDateString()}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Unlocked on {earnedDate.toLocaleString()}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                
                {/* Don't show description in compact mode */}
                {!compact && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                )}
                
                {/* Show category badge in non-compact mode */}
                {!compact && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {achievement.category}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default AchievementsList; 