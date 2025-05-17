import React, { useState, useEffect } from 'react';
import { Trophy, Lock, Award, CheckCircle, Filter, Search, Info, Target, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import achievementManager from '../../services/AchievementManager';
import { useGoals } from '../../contexts/GoalsContext';
import { format } from 'date-fns';

// Debug import
console.log('AchievementsList component imported', { achievementManager });

// Achievement categories and their icons
const CATEGORIES = {
  'all': { name: 'All Achievements', icon: <Trophy size={16} /> },
  'starter': { name: 'Getting Started', icon: <CheckCircle size={16} /> },
  'consistency': { name: 'Consistency', icon: <CheckCircle size={16} /> },
  'milestone': { name: 'Milestones', icon: <Trophy size={16} /> },
  'amount': { name: 'Amount Based', icon: <Award size={16} /> },
  'special': { name: 'Special', icon: <Award size={16} /> },
  'multi-goal': { name: 'Multiple Goals', icon: <Trophy size={16} /> },
  'tools': { name: 'Tools & Features', icon: <CheckCircle size={16} /> },
  'time': { name: 'Time Based', icon: <CheckCircle size={16} /> },
};

const AchievementsList = ({ theme }) => {
  const [allAchievements, setAllAchievements] = useState([]);
  const [earnedAchievements, setEarnedAchievements] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'earned', 'locked'
  const [error, setError] = useState(null);
  const { goals } = useGoals();
  
  console.log("AchievementsList render");
  
  // Force a refresh of achievement data
  const refreshAchievements = () => {
    try {
      console.log("Refreshing achievements data");
      
      // Ensure achievement manager is initialized
      if (!achievementManager.initialized) {
        console.log("Initializing achievement manager from refreshAchievements");
        achievementManager.initialize();
      }
      
      // Get all achievement definitions
      console.log("Getting fresh achievements...");
      const achievements = achievementManager.getAchievements();
      console.log("Fresh achievements loaded:", achievements);
      const achievementsArray = Object.values(achievements);
      setAllAchievements(achievementsArray);
      
      // Get earned achievements
      console.log("Getting fresh earned achievements...");
      const earned = achievementManager.getEarnedAchievements();
      console.log("Fresh earned achievements:", earned);
      setEarnedAchievements(earned);
      
      // Get total points
      console.log("Getting fresh total points...");
      const points = achievementManager.getTotalPoints();
      console.log("Fresh total points:", points);
      setTotalPoints(points);
    } catch (err) {
      console.error("Error refreshing achievements:", err);
      setError(err.message || "Failed to refresh achievements");
    }
  };
  
  // Load achievements on mount
  useEffect(() => {
    try {
      console.log("AchievementsList useEffect");
      
      // Ensure achievement manager is initialized 
      if (!achievementManager.initialized) {
        console.log("Initializing achievement manager from AchievementsList");
        achievementManager.initialize();
      }
      
      // Get all achievement definitions
      console.log("Getting achievements...");
      const achievements = achievementManager.getAchievements();
      console.log("Loaded achievements:", achievements);
      const achievementsArray = Object.values(achievements);
      setAllAchievements(achievementsArray);
      
      // Get earned achievements
      console.log("Getting earned achievements...");
      const earned = achievementManager.getEarnedAchievements();
      console.log("Earned achievements:", earned);
      setEarnedAchievements(earned);
      
      // Get total points
      console.log("Getting total points...");
      const points = achievementManager.getTotalPoints();
      console.log("Total points:", points);
      setTotalPoints(points);
      
      // Check for time-based achievements
      console.log("Checking for time-based achievements...");
      achievementManager.checkTimeBasedAchievements();
    } catch (err) {
      console.error("Error loading achievements:", err);
      setError(err.message || "Failed to load achievements");
    }
  }, []);
  
  // Get filtered achievements
  const getFilteredAchievements = () => {
    try {
      let filtered = [...allAchievements];
      
      // Filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(achievement => achievement.category === selectedCategory);
      }
      
      // Filter by earned status
      if (filterStatus === 'earned') {
        filtered = filtered.filter(achievement => earnedAchievements[achievement.id]);
      } else if (filterStatus === 'locked') {
        filtered = filtered.filter(achievement => !earnedAchievements[achievement.id]);
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          achievement => 
            achievement.title?.toLowerCase().includes(query) || 
            achievement.description?.toLowerCase().includes(query)
        );
      }
      
      // Add earned status and date to each achievement
      return filtered.map(achievement => ({
        ...achievement,
        isEarned: !!earnedAchievements[achievement.id],
        earnedDate: earnedAchievements[achievement.id] || null
      }));
    } catch (err) {
      console.error("Error filtering achievements:", err);
      setError(err.message || "Failed to filter achievements");
      return [];
    }
  };
  
  // Group achievements by category
  const getAchievementsByCategory = () => {
    const filtered = getFilteredAchievements();
    const grouped = {};
    
    filtered.forEach(achievement => {
      if (!achievement.category) return;
      
      if (!grouped[achievement.category]) {
        grouped[achievement.category] = [];
      }
      grouped[achievement.category].push(achievement);
    });
    
    return grouped;
  };
  
  const groupedAchievements = getAchievementsByCategory();
  
  // Calculate statistics
  const earnedCount = Object.keys(earnedAchievements).length;
  const totalCount = allAchievements.length;
  const earnedPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
  
  // Check if we have no goals created yet
  if (!goals || goals.length === 0) {
    return (
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Goals Created Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by creating your first savings goal. Achievements will unlock as you make progress.
            </p>
            <Button asChild className="gap-1">
              <a href="/goals">
                <Plus className="h-4 w-4" /> Create Goal
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
            <h3 className="font-semibold">Error loading achievements</h3>
            <p>{error}</p>
            <Button 
              onClick={refreshAchievements} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Check if we have any achievements
  if (allAchievements.length === 0) {
    return (
      <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Achievements Found</h3>
            <p className="text-muted-foreground mb-4">
              Achievements will appear here as you use the app and make progress toward your goals.
            </p>
            <Button onClick={refreshAchievements} variant="outline">
              Refresh Achievements
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
            <CardDescription>
              {earnedCount} of {totalCount} achievements earned ({earnedPercentage}%)
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Badge variant="outline" className="text-lg flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {totalPoints} points
            </Badge>
            <Button size="sm" variant="ghost" onClick={refreshAchievements}>
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 10L12 14L8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-8 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}`}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className={`w-[130px] ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}`}>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Categories tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-max">
              {Object.entries(CATEGORIES).map(([key, { name, icon }]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                  {icon}
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {/* All achievements tab */}
          <TabsContent value="all" className="mt-4">
            {Object.keys(groupedAchievements).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Award className="h-16 w-16 text-gray-400 mb-3" />
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  No achievements match your filters.
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }} variant="ghost" size="sm" className="mt-2">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedAchievements).map(([category, achievements]) => (
                  <div key={category}>
                    <h3 className={`text-lg font-medium mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                      {CATEGORIES[category]?.icon}
                      {CATEGORIES[category]?.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {achievements.map(achievement => (
                        <AchievementCard 
                          key={achievement.id} 
                          achievement={achievement} 
                          theme={theme} 
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Category specific tabs */}
          {Object.keys(CATEGORIES).filter(category => category !== 'all').map(category => (
            <TabsContent key={category} value={category} className="mt-4">
              {!groupedAchievements[category] || groupedAchievements[category].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Award className="h-16 w-16 text-gray-400 mb-3" />
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                    No achievements match your filters.
                  </p>
                  <Button onClick={() => setFilterStatus('all')} variant="ghost" size="sm" className="mt-2">
                    Show All
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedAchievements[category]?.map(achievement => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement} 
                      theme={theme} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Achievement card component
const AchievementCard = ({ achievement, theme }) => {
  const { id, title, description, icon, points, isEarned, earnedDate, category } = achievement;
  
  const getBorderColor = () => {
    if (isEarned) {
      switch (category) {
        case 'milestone': return 'border-blue-500';
        case 'consistency': return 'border-green-500';
        case 'special': return 'border-purple-500';
        case 'multi-goal': return 'border-orange-500';
        case 'time': return 'border-indigo-500';
        case 'starter': return 'border-green-400';
        default: return 'border-primary';
      }
    }
    return 'border-gray-200 dark:border-gray-700';
  };
  
  const getIconClass = () => {
    if (isEarned) {
      switch (category) {
        case 'milestone': return 'text-blue-500';
        case 'consistency': return 'text-green-500';
        case 'special': return 'text-purple-500';
        case 'multi-goal': return 'text-orange-500';
        case 'time': return 'text-indigo-500';
        case 'starter': return 'text-green-400';
        default: return 'text-primary';
      }
    }
    return 'text-gray-400';
  };
  
  console.log(`Rendering achievement card: ${title}, earned: ${isEarned}`);
  
  return (
    <div 
      className={`relative p-4 rounded-lg border-2 transition-colors ${getBorderColor()} ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } ${isEarned ? 'shadow-md' : ''}`}
    >
      {/* Status indicator ribbon */}
      {isEarned && (
        <div className="absolute -top-1 -right-1 w-auto h-auto">
          <div className={`px-2 py-1 text-xs font-medium text-white rounded-bl-md rounded-tr-md ${
            category === 'milestone' ? 'bg-blue-500' : 
            category === 'consistency' ? 'bg-green-500' : 
            category === 'special' ? 'bg-purple-500' : 
            category === 'multi-goal' ? 'bg-orange-500' : 
            category === 'time' ? 'bg-indigo-500' : 
            'bg-primary'
          }`}>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Unlocked</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Locked overlay */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 dark:bg-gray-900/30 backdrop-blur-[1px] rounded-lg">
          <Lock className="h-6 w-6 text-gray-500" />
        </div>
      )}
      
      <div className={`flex ${isEarned ? '' : 'opacity-60'}`}>
        <div className={`mr-3 ${getIconClass()}`}>
          {icon || <Trophy className="h-6 w-6" />}
        </div>
        
        <div className="flex-1">
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>{title || 'Unknown Achievement'}</h4>
          <p className="text-sm text-muted-foreground">{description || 'No description available'}</p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Badge variant="secondary" className="text-xs">
                {points || 0} points
              </Badge>
              
              {isEarned && earnedDate && (
                <span className="text-xs ml-2 text-muted-foreground">
                  {format(new Date(earnedDate), 'MMM d, yyyy')}
                </span>
              )}
            </div>
            
            {!isEarned && (
              <div className="flex items-center text-muted-foreground">
                <Info className="h-4 w-4 mr-1" />
                <span className="text-xs">Locked</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsList; 