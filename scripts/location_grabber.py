from bs4 import BeautifulSoup
import json, re

# https://aggiemap.tamu.edu/directory/
with open('scripts/directory.html') as data:
	soup = BeautifulSoup(data)

# 208 buildings
# buildings = []
buildings = {}
for item in soup.find_all('td'):
	# abbr = length of content in parens
	abbr_len = item.string.find(')') - item.string.find('(')
	if (abbr_len <= 5):
		url_id = item.a.get('href')[7:]
		name = item.string[:item.string.find('(')-1]
		abbr = item.string[item.string.find('(')+1:len(item.string)-1]
		amazon_abbr = '. '.join(abbr[i:i+1] for i in range(0, len(abbr)+1, 1))
		if (len(abbr) <= 4 and abbr != "CHAN"):
			buildings[name] = { 'id': abbr, 'url': url_id }
			# buildings.append({ 'id': abbr, 'name': { 'synonyms': [abbr, amazon_abbr], 'value': name} })

# For locations.js
with open('data.json', 'w') as outfile:
	dump = json.dumps(buildings, indent=2)
	tabs = re.sub('\n +', lambda match: '\n' + '\t' * (len(match.group().strip('\n')) / 2), dump)
	outfile.write(tabs)

# For updating and uploading our LanguageModel
# with open('languageModel.json') as data:
# 	language_model = json.load(data)

# json_to_change = language_model["languageModel"]["types"][1]
# for item in buildings:
# 	json_to_change["values"].append(item)

# language_model["languageModel"]["types"][1] = json_to_change

# with open('languageModel_added.json', 'w') as data:
# 	dump = json.dumps(language_model, indent=2)
# 	tabs = re.sub('\n +', lambda match: '\n' + '\t' * (len(match.group().strip('\n')) / 2), dump)
# 	data.write(tabs)

# print(json.dumps(buildings['languageModel']['types'],indent=2,sort_keys=True))
# print(buildings['languageModel']['types'])