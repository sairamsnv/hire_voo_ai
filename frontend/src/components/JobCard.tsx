
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Calendar, Users, Star, Bookmark, ExternalLink, Crown, Sparkles, ArrowRight, Shield } from 'lucide-react';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    country: string;
    salary: string;
    level: string;
    type: string;
    skills: string[];
    posted: string;
    applicants: number;
    rating: number;
    premium?: boolean;
  };
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const getCompanyInitials = (company: string) => {
    return company.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Junior': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Mid-Level': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Senior': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Executive': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={`glass card-hover shadow-luxury relative overflow-hidden group backdrop-blur-xl border-white/60 ${job.premium ? 'ring-2 ring-yellow-400/50 shadow-yellow-200/20' : ''}`}>
      {/* Premium Indicator */}
      {job.premium && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 px-4 py-2 rounded-bl-2xl shadow-luxury flex items-center gap-1">
            <Crown className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold">PREMIUM</span>
          </div>
        </div>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14 shadow-luxury ring-2 ring-white/50">
              <AvatarImage src="/placeholder.svg" alt={job.company} />
              <AvatarFallback className="gradient-primary text-white font-bold text-lg">
                {getCompanyInitials(job.company)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-bold text-foreground group-hover:gradient-text transition-all duration-300 leading-tight">
                {job.title}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground font-medium mt-1">
                {job.company}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/80 rounded-xl">
            <Bookmark className="h-5 w-5 text-blue-600" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Location and Salary */}
        <div className="flex items-center justify-between p-4 glass rounded-xl border-white/40">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span className="font-medium">{job.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-green-600 font-bold">
            <DollarSign className="h-5 w-5" />
            <span>{job.salary}</span>
          </div>
        </div>

        {/* Level and Type */}
        <div className="flex items-center space-x-3">
          <Badge className={`${getLevelColor(job.level)} px-4 py-2 text-sm font-semibold border shadow-sm`}>
            {job.level}
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-blue-200 text-blue-700 bg-blue-50">
            {job.type}
          </Badge>
          {job.premium && (
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-semibold flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Skills Required:
          </p>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-sm glass border-white/40 hover:bg-blue-50 transition-colors px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-white/30">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{job.posted}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="font-medium">{job.applicants} applicants</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1 rounded-full">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-yellow-800">{job.rating}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button className="btn-glossy text-white flex-1 group h-12 text-base font-semibold shadow-luxury">
            Apply Now
            <ArrowRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </Button>
          <Button variant="outline" className="glass border-white/50 hover:bg-white/80 h-12 px-6 shadow-premium">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
