import React, { useState, useEffect } from 'react';
import { Trophy, Lock, Award, CheckCircle, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import achievementManager from '../../services/AchievementManager';
import { format } from 'date-fns';

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
  
  // Load achievements on mount
  useEffect(() => {
    // Get all achievement definitions
    const achievements = achievementManager.getAchievements();
    const achievementsArray = Object.values(achievements).map(achievement => ({
      ...achievement,
      isEarned: false,
      earnedDate: null
    }));
    setAllAchievements(achievementsArray);
    
    // Get earned achievements
    const earned = achievementManager.getEarnedAchievements();
    setEarnedAchievements(earned);
    
    // Get total points
    const points = achievementManager.getTotalPoints();
    setTotalPoints(points);
  }, []);
  
  // Get filtered achievements
  const getFilteredAchievements = () => {
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
          achievement.title.toLowerCase().includes(query) || 
          achievement.description.toLowerCase().includes(query)
      );
    }
    
    // Add earned status and date to each achievement
    return filtered.map(achievement => ({
      ...achievement,
      isEarned: !!earnedAchievements[achievement.id],
      earnedDate: earnedAchievements[achievement.id] || null
    }));
  };
  
  // Group achievements by category
  const getAchievementsByCategory = () => {
    const filtered = getFilteredAchievements();
    const grouped = {};
    
    filtered.forEach(achievement => {
      if (!grouped[achievement.category]) {
        grouped[achievement.category] = [];
      }
      grouped[achievement.category].push(achievement);
    });
    
    return grouped;
  };
  
  const filteredAchievements = getFilteredAchievements();
  const groupedAchievements = getAchievementsByCategory();
  
  // Calculate statistics
  const earnedCount = Object.keys(earnedAchievements).length;
  const totalCount = allAchievements.length;
  const earnedPercentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;
  
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
  const { id, title, description, icon, points, isEarned, earnedDate } = achievement;
  
  const getBorderColor = () => {
    if (isEarned) {
      switch (achievement.category) {
        case 'milestone': return 'border-blue-500';
        case 'consistency': return 'border-green-500';
        case 'special': return 'border-purple-500';
        case 'amount': return 'border-yellow-500';
        case 'multi-goal': return 'border-indigo-500';
        case 'tools': return 'border-cyan-500';
        case 'time': return 'border-orange-500';
        default: return 'border-primary';
      }
    }
    return theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  };
  
  return (
    <div 
      className={`flex p-3 rounded-lg border-2 ${getBorderColor()} ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } ${isEarned ? 'opacity-100' : 'opacity-60'}`}
    >
      <div className="flex-shrink-0 mr-3 mt-1">
        <div 
          className={`flex items-center justify-center h-12 w-12 rounded-full ${
            isEarned 
              ? 'bg-primary/20' 
              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          {isEarned ? (
            <span className="text-2xl">{icon}</span>
          ) : (
            <Lock className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : ''}`}>
            {title}
          </h4>
          <Badge 
            variant={isEarned ? "default" : "outline"}
            className={`ml-2 ${!isEarned && theme === 'dark' ? 'text-gray-400' : ''}`}
          >
            {points} pts
          </Badge>
        </div>
        
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
        
        {isEarned && earnedDate && (
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Earned on {format(new Date(earnedDate), 'MMM d, yyyy')}
          </p>
        )}
      </div>
    </div>
  );
};

export default AchievementsList; 