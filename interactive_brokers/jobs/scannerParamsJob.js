import IbConnector from '../index'
import { EVENT } from '../constants'
import convert from 'xml-js'

const EXCLUDED_F1_ELEMENTS = [
	'TwsUiConfig',
	'SettingList',
	'ColumnSets',
	'ScanTypeList',
	'ScannerLayoutList',
	'InstrumentGroupList',
	'MainScreenDefaultTickers',
	'SidecarScannerDefaults',
	'AdvancedScannerDefaults'
]

const main = async () => {
	const connectorConfig = {
		username: 'hxvn0002',
		password: 'Hydra2019'
	}

	const ib = new IbConnector(connectorConfig)

	ib.on(EVENT.ERROR, err => console.log(err))

	try {
		await ib.connect({ uuid: 'fb' })

		const xml = await ib.getScannerParameters()
		const json = convert.xml2json(xml, {
			compact: true,
			spaces: 2,
			ignoreAttributes: true,
			ignoreDoctype: true,
			ignoreDeclaration: true,
			trim: true,
			elementNameFn,
			textFn
		})
		require('fs').writeFile('./dist/params.json', json, err => console.log(err || 'The file was saved!'))
	} catch (err) {
		console.error(err)
	} finally {
		ib.disconnect()
	}
}

const textFn = function (value, parentElement) {
	try {
		const pOpKeys = Object.keys(parentElement._parent)
		const keyNo = pOpKeys.length
		const keyName = pOpKeys[keyNo - 1]
		const arrOfKey = parentElement._parent[keyName]
		const arrOfKeyLen = arrOfKey.length

		if (value === 'true' || value === 'yes') {
			value = 1
		}

		if (value === 'false' || value === 'no') {
			value = 0
		}

		if (arrOfKeyLen > 0) {
			const arr = arrOfKey
			const arrIndex = arrOfKey.length - 1
			arr[arrIndex] = value
		} else {
			parentElement._parent[keyName] = value
		}
	} catch (e) {}
}

const elementNameFn = (val, parentElement) => {
	// root node
	if (!parentElement._parent) {
		return val
	}
	// F1 node
	if (!('ScanParameterResponse' in parentElement._parent)) {
		return val
	}
	const excluded = EXCLUDED_F1_ELEMENTS.some(name => {
		if (name in parentElement) {
			parentElement[name] = undefined
			return
		}
	})
	if (!excluded) {
		return val
	}
}

main().catch(err => console.error(err))
