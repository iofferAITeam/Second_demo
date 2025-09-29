'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ServiceUsage {
  service: string
  conversationsTimes: string | number
  timesUsed: number
  remainingUses: number
}

interface AccountStatusTableProps {
  usageData: ServiceUsage[]
  onPricingClick: () => void
}

export default function AccountStatusTable({ usageData, onPricingClick }: AccountStatusTableProps) {
  return (
    <Card className="flex-1 h-full min-h-[320px] shadow-[0px_0px_100px_0px_rgba(28,93,255,0.16)] border-0 bg-white rounded-[20px] min-w-0 flex flex-col">
      <CardHeader className="pb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-[#1c5dff] rounded"></div>
          <CardTitle className="text-[20px] font-semibold text-black font-['PingFang_SC']">
            Account Status
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1 flex flex-col">
        {/* Service Usage Table */}
        <div className="space-y-4 overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="border-b border-[#E0E0E0] hover:bg-transparent">
                <TableHead className="text-[#808080] text-[14px] font-normal font-['PingFang_SC'] py-3 text-left min-w-[150px]">
                  Service
                </TableHead>
                <TableHead className="text-[#808080] text-[14px] font-normal font-['PingFang_SC'] py-3 text-center min-w-[120px]">
                  Conversations Times
                </TableHead>
                <TableHead className="text-[#808080] text-[14px] font-normal font-['PingFang_SC'] py-3 text-center min-w-[100px]">
                  Times Used
                </TableHead>
                <TableHead className="text-[#808080] text-[14px] font-normal font-['PingFang_SC'] py-3 text-center min-w-[120px]">
                  Remaining Uses
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageData.map((item, index) => (
                <TableRow 
                  key={index} 
                  className="border-b border-[#F0F0F0] last:border-b-0 hover:bg-gray-50/50"
                >
                  <TableCell className="py-4 text-[#1A1A1A] text-[16px] font-normal font-['PingFang_SC'] min-w-[150px]">
                    {item.service}
                  </TableCell>
                  <TableCell className="py-4 text-[#1A1A1A] text-[16px] font-normal font-['PingFang_SC'] text-center min-w-[120px]">
                    {item.conversationsTimes}
                  </TableCell>
                  <TableCell className="py-4 text-[#1A1A1A] text-[16px] font-normal font-['PingFang_SC'] text-center min-w-[100px]">
                    {item.timesUsed}
                  </TableCell>
                  <TableCell className="py-4 text-center min-w-[120px]">
                    <Badge 
                      variant={item.remainingUses <= 1 ? 'destructive' : 'secondary'}
                      className={`text-[16px] font-normal font-['PingFang_SC'] ${
                        item.remainingUses <= 1 
                          ? 'bg-[#f44949] text-white hover:bg-[#f44949]' 
                          : 'bg-[#E6F7FF] text-[#1890FF] hover:bg-[#E6F7FF]'
                      }`}
                    >
                      {item.remainingUses}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pricing Button */}
        <div className="flex justify-end mt-auto">
          <Button 
            onClick={onPricingClick}
            className="bg-black text-white text-[16px] font-normal font-['PingFang_SC'] rounded-[1000px] px-4 py-3 h-auto hover:bg-gray-800 w-full sm:w-auto"
          >
            iOffer Pricing
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
