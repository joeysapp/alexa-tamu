from bs4 import BeautifulSoup


# specify the url
quote_page = 'http://transport.tamu.edu/parking/realtime.aspx'

# query the website and return the html to the variable ‘page’

import urllib.request
with urllib.request.urlopen(quote_page) as url:
    page = url.read()




# parse the html using beautiful soup and store in variable `soup`
soup = BeautifulSoup(page, 'html.parser')

# Take out the <div> of name and get its value
name_box = soup.find('h1', attrs={'class': 'name'})

# get the index price
price_box = soup.find_all('td', attrs={'class':'count'})
price = price_box[3].text
print (price)
