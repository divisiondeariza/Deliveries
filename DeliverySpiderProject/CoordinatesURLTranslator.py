'''
Created on 8/07/2015

@author: emmanuel
'''
import csv
import urlparse

class CoordinatesURLTranslator(object):
    '''
    classdocs
    '''


    def __init__(self):
        '''
        Constructor
        '''

    def getURLsFromCoordinatesCSV(self, csvFilename):     
        with open(csvFilename, "rb") as csvFile:
            csvReader = csv.reader(csvFile)
            urls = self._getURLsFromCoordinates(csvReader) 
        return urls
    
    def getLatitude(self, url):
        coordinates = self._getCoordinates(url)
        return coordinates["lat"]
    
    def getLongitude(self, url):
        coordinates = self._getCoordinates(url)
        return coordinates["lng"]
      
    def _getURLsFromCoordinates(self, coordinates):
        urls = []     
        for row in coordinates:
            formatDict = {"lat":row[0], "lng":row[1]}
            url = "http://www.domiciliosbogota.com/buscar?lat=%(lat)s&lng=%(lng)s" % formatDict
            urls.append(url)
        return urls

    def _getCoordinates(self, url):
        queryPassed = urlparse.urlparse(url).query
        paramsPassed = urlparse.parse_qs(queryPassed)
        coordinates = {key: float(value[0]) for (key, value) in paramsPassed.iteritems()}
        return coordinates

    

    


    
    
    
        