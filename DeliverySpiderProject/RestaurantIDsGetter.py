'''
Created on 7/07/2015

@author: emmanuel
'''
from scrapy.selector.unified import Selector

class RestaurantIDsGetter(object):

    def __init__(self, response):
        self.sel = Selector(response)
        

    
    def getID(self, url):
        xpathQuery = '//a[contains(@href, "' + url + '")]/@data-id'
        queryResults = self.sel.xpath(xpathQuery).extract()
        if len(queryResults) == 0:
            return "NoID"
        return queryResults[0]

    
    
        