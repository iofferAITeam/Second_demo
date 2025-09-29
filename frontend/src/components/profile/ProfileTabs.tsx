'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabComponentProps } from '@/types/profile-form'

export default function ProfileTabs({ activeTab, onTabChange }: TabComponentProps) {
  return (
    <div className="w-[90%] mx-auto">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto gap-[12px]">
          <TabsTrigger 
            value="basic" 
            className="flex-1 flex items-center justify-center px-[16px] py-[13px] cursor-pointer transition-all rounded-tl-[8px] rounded-tr-[8px] rounded-bl-none rounded-br-none border-none bg-transparent data-[state=active]:bg-blue-50 data-[state=active]:text-[#1c5dff] data-[state=active]:font-semibold data-[state=inactive]:text-[#96a3c2] data-[state=inactive]:font-normal data-[state=inactive]:hover:text-[#1c5dff] data-[state=inactive]:hover:bg-blue-50"
          >
            <span className="text-[16px] font-inter">Basic Information</span>
          </TabsTrigger>
          <TabsTrigger 
            value="academic"
            className="flex-1 flex items-center justify-center px-[16px] py-[13px] cursor-pointer transition-all rounded-tl-[8px] rounded-tr-[8px] rounded-bl-none rounded-br-none border-none bg-transparent data-[state=active]:bg-blue-50 data-[state=active]:text-[#1c5dff] data-[state=active]:font-semibold data-[state=inactive]:text-[#96a3c2] data-[state=inactive]:font-normal data-[state=inactive]:hover:text-[#1c5dff] data-[state=inactive]:hover:bg-blue-50"
          >
            <span className="text-[16px] font-inter">Academic Performance</span>
          </TabsTrigger>
          <TabsTrigger 
            value="application"
            className="flex-1 flex items-center justify-center px-[16px] py-[13px] cursor-pointer transition-all rounded-tl-[8px] rounded-tr-[8px] rounded-bl-none rounded-br-none border-none bg-transparent data-[state=active]:bg-blue-50 data-[state=active]:text-[#1c5dff] data-[state=active]:font-semibold data-[state=inactive]:text-[#96a3c2] data-[state=inactive]:font-normal data-[state=inactive]:hover:text-[#1c5dff] data-[state=inactive]:hover:bg-blue-50"
          >
            <span className="text-[16px] font-inter">Application Intentions</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {/* Line under tabs - matches active tab color */}
      <div className="w-full h-[1px] bg-blue-50 mt-0"></div>
    </div>
  )
}
