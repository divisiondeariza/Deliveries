'''
Created on 28/06/2015

@author: emmanuel
'''
from scrapy.selector.unified import Selector

class RestaurantSelector(Selector):
    '''
    classdocs
    '''
    
    def getName(self):
        return self.xpath('//h2/text()').extract()[0]
        
    
        