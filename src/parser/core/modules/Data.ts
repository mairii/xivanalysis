import {getDataBy} from 'data'
import {Action, layers as actionLayers, root as actionRoot} from 'data/ACTIONS'
import {applyLayer, Layer} from 'data/layer'
import {layers as statusLayers, root as statusRoot, Status} from 'data/STATUSES'
import {Analyser} from 'parser/core/Analyser'

export class Data extends Analyser {
	static handle = 'data'

	private appliedCache = new Map<unknown, unknown>()

	get actions() {
		return this.getAppliedData(actionRoot, actionLayers)
	}

	get statuses() {
		return this.getAppliedData(statusRoot, statusLayers)
	}

	getAction(id: Action['id']) {
		return getDataBy(this.actions, 'id', id)
	}

	getStatus(id: Status['id']) {
		return getDataBy(this.statuses, 'id', id)
	}

	private getAppliedData<R>(root: R, layers: Array<Layer<R>>): R {
		const cached = this.appliedCache.get(root)
		if (cached) {
			return cached as R
		}

		this.debug('generating applied data for', root)

		const applied = layers
			.filter(layer => this.parser.patch.compare(layer.patch) >= 0)
			.reduce(applyLayer, root)
		this.appliedCache.set(root, applied)

		return applied
	}
}
