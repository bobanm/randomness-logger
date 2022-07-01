<script setup lang="ts">

import { ref } from 'vue'

const props = defineProps({
    history: Array<HistoryEntry>
})

const displayRowOptions = [5, 10, 20, 100]
let rowCount = ref<number>(5)
    
</script>

<template>

<section class="top-green">
    <img src="../images/pilot.svg" class="right zoom">
    <h2>Random Numbers History</h2>
    <div v-if="history?.length">
        <table>
            <thead>
                <tr>
                    <th>Request ID</th>
                    <th>Request date</th>
                    <th>Response date</th>
                    <th>Request block</th>
                    <th>Response block</th>
                    <th>Requestor address</th>
                    <th>Random number</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="i in Math.min(history.length, rowCount)" :key="i">
                    <td>{{ history[i - 1].requestId.toString().ellipsify(7, 3) }}</td>
                    <td>{{ history[i - 1].requestTimestamp.toNumber().toDateString() }}</td>
                    <td>{{ history[i - 1].responseTimestamp?.toNumber().toDateString() ?? '' }}</td>
                    <td>{{ history[i - 1].requestBlockNumber.toString().padEnd(8) }}</td>
                    <td>{{ history[i - 1].responseBlockNumber?.toString().padEnd(8) ?? '' }}</td>
                    <td>{{ history[i - 1].requestorAddress.ellipsify(8, 3) }}</td>
                    <td>{{ history[i - 1].randomNumber?.toString().ellipsify(7, 3) ?? '' }}</td>
                </tr>
            </tbody>
        </table>
        <label>Show max
            <select v-model.number="rowCount">
                <option v-for="displayRowOption of displayRowOptions">{{ displayRowOption }}</option>
            </select>records
        </label>
    </div>
</section>

</template>