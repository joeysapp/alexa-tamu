from bs4 import BeautifulSoup
import sys

# specify the url
quote_page = 'http://transport.tamu.edu/parking/realtime.aspx'

# query the website and return the html to the variable ‘page’

import urllib.request
with urllib.request.urlopen(quote_page) as url:
    page = url.read()




# parse the html using beautiful soup and store in variable `soup`
soup = BeautifulSoup(page, 'html.parser')


# spotsList contains 4 entries containing the 4 garages number of spots left
spotsList = soup.find_all('td', attrs={'class':'count'})
# this takes the first argument (garage number) and grabs the corresponding number of empty spots
numSpots = spotsList[sys.argv[1]].text
# currently just printing to console.  Will ultimately output to node.js
print (numSpots)
sys.stdout.flush()
