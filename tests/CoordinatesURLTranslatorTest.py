'''
Created on 8/07/2015

@author: emmanuel
'''
import unittest
from DeliverySpiderProject.CoordinatesURLTranslator import CoordinatesURLTranslator
from mock import  patch
import io

class CoordinatesURLTranslatorTest(unittest.TestCase):


    def setUp(self):
        self.translator = CoordinatesURLTranslator()


    def tearDown(self):
        pass

    @patch("__builtin__.open")
    def testGetURLsFromCoordinatesCSV(self, mockOpen):
        mockOpen.return_value =  io.BytesIO(b"4.681951,-74.050877\n4.680840,-74.046985")
        urls = self.translator.getURLsFromCoordinatesCSV("coordinates.csv")
        expectedURLs = ["http://www.domiciliosbogota.com/buscar?lat=4.681951&lng=-74.050877",
                        "http://www.domiciliosbogota.com/buscar?lat=4.680840&lng=-74.046985"]
        self.assertEquals(urls, expectedURLs)
    
    def testGetLatitudeFromUrl(self):
        url = "http://www.domiciliosbogota.com/buscar?lat=4.681951&lng=-74.050877"
        latitude = self.translator.getLatitude(url)
        expectedLatitude = 4.681951
        self.assertEquals(latitude, expectedLatitude)
        
    def testGetLongitudeFromUrl(self):
        url = "http://www.domiciliosbogota.com/buscar?lat=4.681951&lng=-74.050877"
        longitude = self.translator.getLongitude(url)
        expectedLongitude = -74.050877
        self.assertEquals(longitude, expectedLongitude)


if __name__ == "__main__":
    #import sys;sys.argv = ['', 'Test.testName']
    unittest.main()