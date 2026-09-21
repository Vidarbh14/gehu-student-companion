# Mathematical Attendance Engine Specification

The **GEHU Student Companion** does not guess attendance metrics. Every calculation is derived from exact mathematical formulations.

---

## 1. Core Variables

* $A$: Classes attended
* $C$: Classes conducted ($C \ge A \ge 0$)
* $R$: Remaining scheduled classes derived from the timetable and academic calendar
* $T$: Official target attendance (e.g. $75\% = 0.75$)
* $B$: User safety buffer percentage (e.g. $2\% = 0.02$)
* $T_{eff}$: Effective target $= T + B$ (e.g. $77\% = 0.77$)

---

## 2. Current Attendance Percentage

$$
\text{Attendance} = \begin{cases}
100.0\% & \text{if } C = 0 \\
\frac{A}{C} \times 100 & \text{if } C > 0
\end{cases}
$$

* Clamped to $A \le C$ to protect against data entry anomalies.
* Division by zero is strictly guarded.

---

## 3. Attendance Status Tiers

| Tier | Condition | Meaning |
| :--- | :--- | :--- |
| **SAFE** | $\text{Attendance} \ge T_{eff} + 3.0\%$ | Comfortable attendance margin; multiple absences safe |
| **WATCH** | $T_{eff} \le \text{Attendance} < T_{eff} + 3.0\%$ | At or near safety target; limited absences |
| **RISK** | $T \le \text{Attendance} < T_{eff}$ | Meets university 75% minimum, but below chosen safety buffer |
| **CRITICAL** | $\text{Attendance} < T$ | Strictly below 75% minimum; debarment risk |

---

## 4. Maximum Immediate Absences

> "How many classes can I miss right now without dropping below $T_{eff}$?"

Requirement:
$$
\frac{A}{C + x} \ge T_{eff} \iff A \ge T_{eff} \cdot (C + x) \iff T_{eff} \cdot x \le A - T_{eff} \cdot C \iff x \le \frac{A}{T_{eff}} - C
$$

Since $x$ must be an integer:
$$
x_{max} = \max\left(0, \left\lfloor \frac{A}{T_{eff}} - C \right\rfloor\right)
$$

### Example (36 / 42 at 75% Target):
$$
x_{max} = \left\lfloor \frac{36}{0.75} - 42 \right\rfloor = 48 - 42 = 6 \text{ classes}
$$
* If student misses 6 classes: $\frac{36}{48} = 75.0\%$ (Target met).
* If student misses 7 classes: $\frac{36}{49} = 73.47\%$ (Below target).

### Example with 2% Buffer ($T_{eff} = 77\%$):
$$
x_{max} = \left\lfloor \frac{36}{0.77} - 42 \right\rfloor = \lfloor 46.75 - 42 \rfloor = 4 \text{ classes}
$$

---

## 5. Maximum Future Absences Across $R$ Remaining Classes

> "Out of the $R$ remaining classes in the semester, what is the maximum number of classes $m$ I can miss while finishing at $\ge T_{eff}$?"

Final conducted $= C + R$.
Final attended $= A + (R - m)$.
Requirement:
$$
\frac{A + R - m}{C + R} \ge T_{eff} \iff A + R - m \ge T_{eff} \cdot (C + R) \iff m \le A + R - T_{eff} \cdot (C + R)
$$

Therefore:
$$
m_{max} = \min\left(R, \max\left(0, \lfloor A + R - T_{eff} \cdot (C + R) \rfloor\right)\right)
$$

---

## 6. Recovery Classes Calculation

> "If my attendance is currently below target ($\frac{A}{C} < T$), how many consecutive classes $y$ must I attend without absence to reach $\ge T$?"

Requirement:
$$
\frac{A + y}{C + y} \ge T \iff A + y \ge T \cdot C + T \cdot y \iff y(1 - T) \ge T \cdot C - A \iff y \ge \frac{T \cdot C - A}{1 - T}
$$

Since $y$ must be an integer:
$$
y_{min} = \left\lceil \frac{T \cdot C - A}{1 - T} \right\rceil
$$

### Example (28 / 42 at 75% Target):
$$
y_{min} = \left\lceil \frac{0.75 \times 42 - 28}{1 - 0.75} \right\rceil = \left\lceil \frac{31.5 - 28}{0.25} \right\rceil = \left\lceil \frac{3.5}{0.25} \right\rceil = 14 \text{ classes}
$$
* After 14 consecutive classes: Attended $= 28 + 14 = 42$, Conducted $= 42 + 14 = 56$.
* New percentage $= \frac{42}{56} = 75.0\%$.

---

## 7. Date-Aware Remaining Classes

Unlike naive calculators that assume "20 classes a month", this system:
1. Iterates day-by-day from tomorrow until the official semester end date.
2. Cross-references the **GEHU Academic Calendar**:
   * Skips all declared holidays and vacation periods.
   * Skips examination blocks (Mid-Sem, End-Sem, Practicals).
   * Skips non-teaching days (Sundays).
3. Evaluates the student's **Weekly Timetable** to count exact scheduled lectures for each subject on each remaining teaching day.
