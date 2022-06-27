<script lang="ts">

export default {
    props: ['history'],
}

</script>

<template>

<section class="top-green">
    <img src="../images/pilot.svg" class="right zoom">
    <h2>Random Numbers History</h2>
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
            <tr v-for="historyEntry in history" :key="historyEntry.requestId.toString()">
                <td>{{ historyEntry.requestId.toString().ellipsify(7, 3) }}</td>
                <td>{{ historyEntry.requestTimestamp.toNumber().toDateString() }}</td>
                <td>{{ historyEntry.responseTimestamp?.toNumber().toDateString() ?? '' }}</td>
                <td>{{ historyEntry.requestBlockNumber.toString().padEnd(8) }}</td>
                <td>{{ historyEntry.responseBlockNumber?.toString().padEnd(8) ?? '' }}</td>
                <td>{{ historyEntry.requestorAddress.ellipsify(8, 3) }}</td>
                <td>{{ historyEntry.randomNumber?.toString().ellipsify(7, 3) ?? '' }}</td>
            </tr>
        </tbody>
    </table>
</section>

</template>