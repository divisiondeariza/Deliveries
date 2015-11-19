# -*- coding: utf-8 -*-
'''
Created on 28/06/2015

@author: emmanuel
'''
import re
from scrapy.selector.unified import Selector
import numpy


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
        cssQuery = '.info-extra .third .funcion-view::text'
        return self.css(cssQuery).extract()[0].strip()
    
    def getPayMethods(self):
        payMethodClasses = self.css(".tipos_pago div::attr(class)").extract()
        payMethods = [payMethodClass.split(" ")[1] for payMethodClass in payMethodClasses]
        return payMethods

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
    
    def getID(self):
        return self.css("script::text").extract()

    def getNumberOfProducts(self):
        menuCategories = self.getMenuCategories()
        return sum([len(category["productIDs"]) for category in menuCategories])
    
    def getMeanProductsPerCategory(self):
        totalMenuCategories = len(self.getMenuCategories())
        if totalMenuCategories == 0:
            return 0
        return self.getNumberOfProducts()/totalMenuCategories
    
    def getCheapestPriceForProduct(self):
        prices = self._getPriceList()
        if len(prices)  == 0:
            return 0
        return min(prices)
     
    def getMostExpensivePriceForProduct(self):
        prices =  self._getPriceList()
        if len(prices)  == 0:
            return 0
        return max(prices)
     
    def getMedianOfPrices(self):
        prices =  self._getPriceList()
        return numpy.median(prices)
 
    def getMeanOfPrices(self):
        prices =  self._getPriceList()
        return numpy.mean(prices)
 
    def acceptsCash(self):
        return "pago-efectivo" in self.getPayMethods()

    def acceptsCredit(self):
        return "pago-credito" in self.getPayMethods()

    def acceptsDebit(self):
        return "pago-debito" in self.getPayMethods()
 
    def acceptsSodexo(self):
        return "pago-sodexo" in self.getPayMethods()
    
    def hasTagsFromList(self, categoriesList):
        for tag in self.getTagCategories():
            if tag in categoriesList:
                return True
        return False
              
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
    
    def _getPriceList(self):
        pricesStrings = self.css(".price::attr(itemprice)").extract()
        prices = [float(priceString) for priceString in pricesStrings]
        return prices


    
    


    
    
