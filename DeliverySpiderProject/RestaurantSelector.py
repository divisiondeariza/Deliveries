'''
Created on 28/06/2015

@author: emmanuel
'''
import re
from scrapy.selector.unified import Selector


class RestaurantSelector(Selector):

    def getName(self):
        xpathQuery = '//h2/text()'
        return self.xpath(xpathQuery).extract()[0]
        
    def getDeliveryTimeInMinutes(self):
        cssQuery = '.info-extra .first .min-oder-view::text'
        return self._extractIntegerFromTag(cssQuery)
    
    def getMinOrderPrice(self):
        cssQuery = '.info-extra .second .min-oder-view::text'
        return self._extractIntegerFromTag(cssQuery)
        
    def getDeliveryCost(self):
        cssQuery = '.info-extra .third .funcion-view'
        return self._extractIntegerFromTag(cssQuery)
    
    def getPayMethods(self):
        return self.css(".tipos_pago div::attr(title)").extract()

    def getMenuCategories(self):
        cssNameQuery = '.menu-categories ul li'
        categorylist = self.css(cssNameQuery)
        return [self._getCategoryData(category) for category in categorylist]
    
    def getTagCategories(self):
        return self.css(".restaurant-header a::text").extract()
    
    def getAveragePunctuation(self):
        cssQuery = ".rating .rated::attr(class)"
        return self._extractIntegerFromTag(cssQuery)
    
    def getQuantityOfComments(self):
        cssQuery = ".restaurant-info .suggest-rating .link-comentarios::text"
        return self._extractIntegerFromTag(cssQuery)
 
    def _getCategoryData(self, category):
        categoryName = self._getCategoryName(category)
        productIDs = self._getProductsByCategory(category)
        categoryData = {"name":categoryName, "productIDs":productIDs}
        return categoryData       
    
    def _getCategoryName(self, category):
        return category.xpath("text()").extract()[0].strip()

    def _getProductsByCategory(self, category):
        numericID = self._getCategoryID(category)
        cssQuery = "div #category-" + numericID + " ul li::attr(id)"
        productsContainer = self.css(cssQuery).extract()  
        return productsContainer
     
    def _getCategoryID(self, category):
        return category.css("::attr(id)").extract()[0].split("-")[1]
    
    def _extractIntegerFromTag(self, cssQuery):
        text = self.css(cssQuery).extract()[0].replace(",", "")
        if(re.search(r'\d+', text) is not None):
            numericString = re.findall(r'\d+', text)[0]
            return int(numericString)
        return 0
    
    def getID(self):
        return self.css("script::text").extract()
    
    
        