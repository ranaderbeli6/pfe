import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StatVentesMensuelles = () => {
    const [ventesMensuelles, setVentesMensuelles] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [filteredVentes, setFilteredVentes] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/statsadmin/ventes-mensuelles')
            .then(res => {
                setVentesMensuelles(res.data.monthlySales);
                const years = [...new Set(res.data.monthlySales.map(item => item.mois.split(' ')[1]))];
                setAvailableYears(years.sort());
            })
            .catch(err => {
                console.error("Erreur récupération ventes mensuelles :", err);
            });
    }, []);

    useEffect(() => {
        let filtered = ventesMensuelles;

        if (selectedYear) {
            filtered = filtered.filter(vente => vente.mois.includes(selectedYear));
        }

        if (selectedMonth) {
            filtered = filtered.filter(vente => vente.mois.startsWith(selectedMonth));
        }

        setFilteredVentes(filtered);
    }, [ventesMensuelles, selectedYear, selectedMonth]);

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
        setSelectedMonth(''); 
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const getMonths = (year) => {
        if (!year) return [];
        const months = [
            'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
            'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
        ];
        return [...new Set(ventesMensuelles.filter(v => v.mois.includes(year)).map(v => v.mois.split(' ')[0]))].sort((a, b) => months.indexOf(a) - months.indexOf(b));
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Ventes Mensuelles</h2>

            <div className="mb-4 flex items-center space-x-4">
                <div>
                    <label htmlFor="year" className="block text-gray-700 text-sm font-bold mb-2">Année:</label>
                    <select
                        id="year"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={selectedYear}
                        onChange={handleYearChange}
                    >
                        <option value="">Toutes les années</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="month" className="block text-gray-700 text-sm font-bold mb-2">Mois:</label>
                    <select
                        id="month"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        disabled={!selectedYear}
                    >
                        <option value="">Tous les mois</option>
                        {getMonths(selectedYear).map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
            </div>

            <table className="min-w-full border border-gray-300 text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="px-4 py-2 border">Mois</th>
                        <th className="px-4 py-2 border">Ventes</th>
                        <th className="px-4 py-2 border">Chiffre d'affaires (DNT)</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredVentes.map((vente, index) => (
                        <tr key={index} className="text-center">
                            <td className="border px-4 py-2">{vente.mois}</td>
                            <td className="border px-4 py-2">{vente.ventes}</td>
                            <td className="border px-4 py-2">{vente.ca.toFixed(2)} DNT</td>
                        </tr>
                    ))}
                    {filteredVentes.length === 0 && (
                        <tr>
                            <td className="border px-4 py-2 text-center" colSpan="3">Aucune vente trouvée pour la sélection.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StatVentesMensuelles;